<template>
  <div ref="containerRef" class="relative w-full" :style="{ height: `${height}px` }">
    <div
      v-if="chartPhase === 'loading'"
      class="absolute inset-0 z-10 bg-surface-2 animate-pulse rounded"
      aria-busy="true"
    />
    <div
      v-else-if="chartPhase === 'empty'"
      class="absolute inset-0 z-10 flex items-center justify-center rounded bg-surface-2"
    >
      <span class="px-4 text-center font-mono text-xs text-content-faint">尚無 K 線資料</span>
    </div>
    <div
      v-else-if="chartPhase === 'error'"
      class="absolute inset-0 z-10 flex items-center justify-center rounded bg-surface-2"
    >
      <span class="px-4 text-center font-mono text-xs text-content-faint">{{ errorHint }}</span>
    </div>
    <div ref="chartRef" class="relative z-0 min-h-[1px] h-full w-full" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { createChart } from 'lightweight-charts'
import type { IChartApi, ISeriesApi, CandlestickData, LineData, HistogramData, SeriesMarker, Time } from 'lightweight-charts'
import { useTweaksStore } from '@/stores/tweaks'
import type { OhlcvPoint } from '@/types'
import { normalizeChartData, toChartDayKey } from '@/utils/chartData'

const props = withDefaults(defineProps<{
  candles: OhlcvPoint[]
  twseClosedDates?: string[]
  exDates?: string[]
  height?: number
  /** 外部資料載入中（避免與「空資料」混淆） */
  loading?: boolean
  /** 以折線圖模式顯示（僅用收盤價，適合指數等無完整 OHLC 的資料） */
  lineMode?: boolean
  /** 強制覆蓋成交量顯示設定；未傳入時沿用 tweaks store */
  showVolume?: boolean
}>(), {
  candles: () => [],
  twseClosedDates: () => [],
  exDates: () => [],
  height: 320,
  loading: false,
  lineMode: false,
  showVolume: undefined,
})

const tweaksStore = useTweaksStore()

const effectiveShowVolume = computed<boolean>(() =>
  props.showVolume !== undefined ? props.showVolume : tweaksStore.settings.showVolume,
)
const containerRef = ref<HTMLDivElement>()
const chartRef = ref<HTMLDivElement>()

let chart: IChartApi | null = null
let candleSeries: ISeriesApi<'Candlestick'> | ISeriesApi<'Line'> | null = null
let volSeries: ISeriesApi<'Histogram'> | null = null
let ro: ResizeObserver | null = null

let initAttempts = 0
const MAX_INIT_ATTEMPTS = 120

const normalized = computed(() =>
  normalizeChartData(props.candles, { closedDates: new Set(props.twseClosedDates) }),
)

const chartPhase = computed<'loading' | 'ready' | 'empty' | 'error'>(() => {
  if (props.loading) return 'loading'
  const n = normalized.value
  if (n.kind === 'ready') return 'ready'
  if (n.kind === 'empty') return 'empty'
  return 'error'
})

const errorHint = computed<string>(() =>
  normalized.value.kind === 'error' ? normalized.value.reason : '無法顯示圖表',
)

const seriesCandles = computed<OhlcvPoint[]>(() =>
  normalized.value.kind === 'ready' ? normalized.value.candles : [],
)

const candleDateSet = computed<Set<string>>(
  () => new Set(seriesCandles.value.map((c) => c.date)),
)

const upColor = computed<string>(() =>
  tweaksStore.settings.upRed ? '#ef4444' : '#22c55e',
)

const downColor = computed<string>(() =>
  tweaksStore.settings.upRed ? '#22c55e' : '#ef4444',
)

/**
 * 容器是否具備可用的寬高（避免 0 尺寸建立圖表）
 * @returns 尺寸有效為 true
 */
const isValidContainerSize = (): boolean => {
  const wrap = containerRef.value
  if (!wrap) return false
  return wrap.clientWidth > 0 && wrap.clientHeight > 0
}

/**
 * 移除圖表實例並清空區域引用
 */
const teardownChart = (): void => {
  chart?.remove()
  chart = null
  candleSeries = null
  volSeries = null
}

watch(
  normalized,
  (n) => {
    if (n.kind === 'error') {
      console.warn('[TvChart] K 線資料正規化失敗', { reason: n.reason })
    }
  },
  { immediate: true },
)

watch(chartPhase, (phase) => {
  if (phase !== 'ready') {
    teardownChart()
    initAttempts = 0
    return
  }
  void nextTick(() => {
    tryInitChart()
  })
})

/**
 * 組裝與應用 TradingView 深色主題選項
 */
const applyTheme = (): void => {
  if (!chart) return
  chart.applyOptions({
    layout: {
      background: { color: '#0a0a0b' },
      textColor: 'rgba(255,255,255,0.38)',
    },
    grid: {
      vertLines: { color: 'rgba(255,255,255,0.04)' },
      horzLines: { color: 'rgba(255,255,255,0.04)' },
    },
    crosshair: {
      vertLine: { color: 'rgba(255,255,255,0.3)', labelBackgroundColor: '#16161a' },
      horzLine: { color: 'rgba(255,255,255,0.3)', labelBackgroundColor: '#16161a' },
    },
    rightPriceScale: {
      borderColor: 'rgba(255,255,255,0.06)',
      textColor: 'rgba(255,255,255,0.38)',
    },
    timeScale: {
      borderColor: 'rgba(255,255,255,0.06)',
      tickMarkFormatter: (time: Time): string => {
        const dayKey = (() => {
          if (typeof time === 'string') return time
          if (typeof time === 'number') {
            const d = new Date(time * 1000)
            return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
          }
          const t = time as { year: number; month: number; day: number }
          return `${t.year}-${String(t.month).padStart(2, '0')}-${String(t.day).padStart(2, '0')}`
        })()
        return candleDateSet.value.has(dayKey) ? dayKey.slice(5) : ''
      },
    },
  })
}

/**
 * 套用除息日標記至 K 線 series
 */
const applyExDateMarkers = (): void => {
  if (!candleSeries || !props.exDates?.length) return
  const markers: SeriesMarker<Time>[] = [...props.exDates]
    .map((d) => toChartDayKey(d) ?? d.slice(0, 10))
    .filter((d) => d.length === 10)
    .sort()
    .map((d) => ({
      time: d as Time,
      position: 'aboveBar',
      color: '#ef4444',
      shape: 'arrowDown',
      text: '除',
    }))
  candleSeries.setMarkers(markers)
}

/**
 * 以目前 seriesCandles 更新 K 線與成交量 series
 */
const refreshSeriesData = (): void => {
  if (!candleSeries || !volSeries) return

  const candles = seriesCandles.value

  if (props.lineMode) {
    const lineData: LineData[] = candles.map((c) => ({ time: c.date as Time, value: c.close }))
    ;(candleSeries as ISeriesApi<'Line'>).setData(lineData)
  } else {
    const candleData: CandlestickData[] = candles.map((c) => ({
      time: c.date as Time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }))
    ;(candleSeries as ISeriesApi<'Candlestick'>).setData(candleData)
  }

  const volData: HistogramData[] = candles.map((c) => ({
    time: c.date as Time,
    value: c.volume,
    color: c.close >= c.open ? `${upColor.value}55` : `${downColor.value}55`,
  }))
  volSeries.setData(volData)

  chart?.timeScale().fitContent()
}

/**
 * 更新 K 線燭台顏色（跟隨 tweaks.upRed）
 */
const refreshCandleColors = (): void => {
  if (!candleSeries || !volSeries || props.lineMode) return

  candleSeries.applyOptions({
    upColor: upColor.value,
    downColor: downColor.value,
    borderUpColor: upColor.value,
    borderDownColor: downColor.value,
    wickUpColor: upColor.value,
    wickDownColor: downColor.value,
  })

  const candles = seriesCandles.value
  const volData: HistogramData[] = candles.map((c) => ({
    time: c.date as Time,
    value: c.volume,
    color: c.close >= c.open ? `${upColor.value}55` : `${downColor.value}55`,
  }))
  volSeries.setData(volData)
}

/**
 * 建立 lightweight-charts 實例與 series（呼叫前須確認尺寸與資料就緒）
 */
const initChart = (): void => {
  if (!chartRef.value || chartPhase.value !== 'ready' || seriesCandles.value.length === 0) return

  chart = createChart(chartRef.value, {
    /** 與容器綁定尺寸，避免固定像素與 DOM 不符導致 canvas 無法繪製 */
    autoSize: true,
    handleScroll: true,
    handleScale: true,
  })

  applyTheme()

  if (props.lineMode) {
    candleSeries = chart.addLineSeries({ color: '#60a5fa', lineWidth: 2 })
  } else {
    candleSeries = chart.addCandlestickSeries({
      upColor: upColor.value,
      downColor: downColor.value,
      borderUpColor: upColor.value,
      borderDownColor: downColor.value,
      wickUpColor: upColor.value,
      wickDownColor: downColor.value,
    })
  }

  chart.priceScale('right').applyOptions({
    scaleMargins: { top: 0.05, bottom: 0.25 },
  })

  volSeries = chart.addHistogramSeries({ priceScaleId: 'volume' })
  chart.priceScale('volume').applyOptions({
    scaleMargins: { top: 0.8, bottom: 0 },
  })

  refreshSeriesData()
  applyExDateMarkers()
  applyVolumeVisibility(effectiveShowVolume.value)
}

/**
 * 在容器尺寸有效時初始化圖表，否則以 rAF 重試（避免掛載當下寬度為 0）
 */
const tryInitChart = (): void => {
  if (chartPhase.value !== 'ready' || chart) return
  if (!chartRef.value || !containerRef.value) return

  if (!isValidContainerSize()) {
    initAttempts += 1
    if (initAttempts <= MAX_INIT_ATTEMPTS) {
      requestAnimationFrame(() => tryInitChart())
    } else {
      console.warn('[TvChart] 容器尺寸長時間為 0，無法初始化圖表')
    }
    return
  }

  initAttempts = 0
  initChart()
}

onMounted(() => {
  void nextTick(() => {
    tryInitChart()
  })

  ro = new ResizeObserver(() => {
    if (!chart) tryInitChart()
  })
  if (containerRef.value) ro.observe(containerRef.value)
})

onUnmounted(() => {
  ro?.disconnect()
  teardownChart()
})

watch(seriesCandles, () => {
  if (chartPhase.value !== 'ready') return
  if (!chart) {
    tryInitChart()
    return
  }
  refreshSeriesData()
})

watch(() => props.exDates, applyExDateMarkers)

/**
 * 顯示或隱藏成交量子圖，並調整 K 線價格軸下緣空白。
 * @param show 是否顯示成交量
 */
const applyVolumeVisibility = (show: boolean): void => {
  if (!chart || !volSeries) return
  volSeries.applyOptions({ visible: show })
  chart.priceScale('right').applyOptions({
    scaleMargins: { top: 0.05, bottom: show ? 0.25 : 0.05 },
  })
}

watch([() => tweaksStore.settings.upRed, () => tweaksStore.settings.accent], refreshCandleColors)
watch(effectiveShowVolume, applyVolumeVisibility)
</script>
