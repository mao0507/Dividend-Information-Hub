<template>
  <AppLayout :breadcrumbs="['股票', code]">
    <div v-if="loading" class="flex items-center justify-center h-full">
      <div class="font-mono text-content-faint text-sm">載入中…</div>
    </div>

    <div v-else-if="stock" class="overflow-auto">
      <div class="max-w-[1200px] mx-auto p-6 space-y-6">

        <!-- Header -->
        <div class="flex items-start gap-4">
          <!-- 色塊 Logo -->
          <div
            class="w-14 h-14 rounded-[12px] flex items-center justify-center font-mono text-lg font-bold text-white shrink-0"
            :style="{ background: `linear-gradient(135deg, var(--accent), #3b82f6)` }"
          >{{ code.slice(0, 2) }}</div>

          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <h1 class="text-xl font-semibold text-content">{{ stock.name }}</h1>
              <span class="font-mono text-sm text-content-faint">{{ stock.code }}</span>
              <span class="font-mono text-[10px] text-content-faint px-1.5 py-0.5 bg-surface-3 rounded">{{ stock.market }}</span>
              <Chip :pt="{ root: { style: { color: 'var(--accent)', background: 'rgba(34,197,94,0.12)' } } }">{{ stock.sector }}</Chip>
              <Chip v-if="stock.isEtf" :pt="{ root: { style: { color: '#3b82f6', background: 'rgba(59,130,246,0.12)' } } }">ETF</Chip>
              <Chip v-if="latestDiv" :pt="{ root: { style: { color: '#f59e0b', background: 'rgba(245,158,11,0.12)' } } }">
                {{ FREQ_LABEL[latestDiv.freq] ?? latestDiv.freq }}
              </Chip>
              <Chip v-if="stock.streak > 0" :pt="{ root: { style: { color: '#a855f7', background: 'rgba(168,85,247,0.12)' } } }">
                連 {{ stock.streak }} 年
              </Chip>
            </div>
            <div class="mt-1 flex items-baseline gap-3">
              <span class="font-mono text-3xl font-bold text-content">{{ stock.price.toFixed(2) }}</span>
              <span :class="['font-mono text-base', stock.change >= 0 ? 'text-up' : 'text-down']">
                {{ stock.change >= 0 ? '+' : '' }}{{ stock.change.toFixed(2) }}
              </span>
              <span :class="['font-mono text-sm', stock.changePct >= 0 ? 'text-up' : 'text-down']">
                ({{ stock.changePct >= 0 ? '+' : '' }}{{ stock.changePct.toFixed(2) }}%)
              </span>
            </div>
          </div>

          <!-- 操作按鈕 -->
          <div class="flex gap-2 shrink-0">
            <button
              type="button"
              class="px-3 py-1.5 text-[12px] font-mono bg-surface-2 border border-border rounded-[8px] text-content-soft hover:text-content transition-colors inline-flex items-center gap-1.5"
            >
              <ThemedIcon name="star" size-class="w-3.5 h-3.5" />
              加入自選
            </button>
            <button
              type="button"
              class="px-3 py-1.5 text-[12px] font-mono bg-surface-2 border border-border rounded-[8px] text-content-soft hover:text-content transition-colors inline-flex items-center gap-1.5"
            >
              <ThemedIcon name="bolt" size-class="w-3.5 h-3.5" />
              設提醒
            </button>
          </div>
        </div>

        <!-- KPI 6格 -->
        <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          <div v-for="kpi in kpiItems" :key="kpi.label" class="bg-surface-2 border border-border rounded-[var(--radius)] p-3">
            <div class="text-[10px] font-mono text-content-faint uppercase tracking-widest mb-1">{{ kpi.label }}</div>
            <div class="font-mono text-base font-semibold" :style="{ color: kpi.color ?? 'var(--accent)' }">{{ kpi.value }}</div>
          </div>
        </div>

        <!-- 走勢圖 -->
        <div class="bg-surface-2 border border-border rounded-[var(--radius)] overflow-hidden">
          <div class="flex items-center gap-3 px-5 py-3 border-b border-border">
            <span class="font-mono text-xs text-content-soft uppercase tracking-widest">價格走勢</span>
            <div class="flex gap-1 ml-auto">
              <button
                v-for="r in RANGES"
                :key="r"
                :class="['px-2 py-0.5 text-[10px] font-mono rounded transition-colors', activeRange === r ? 'bg-accent/20 text-accent' : 'text-content-soft hover:text-content']"
                @click="activeRange = r"
              >{{ r }}</button>
            </div>
          </div>
          <TvChart
            :candles="prices"
            :twse-closed-dates="twseClosedDates"
            :ex-dates="exDateStrings"
            :loading="pricesLoading"
            :height="304"
            class="w-full"
          />
        </div>

        <!-- 配息歷史 10 年 -->
        <div class="bg-surface-2 border border-border rounded-[var(--radius)] overflow-hidden">
          <div class="px-5 py-3 border-b border-border">
            <span class="font-mono text-xs text-content-soft uppercase tracking-widest">配息歷史</span>
          </div>
          <div class="p-4 overflow-x-auto">
            <div class="flex items-end gap-2 min-w-[600px]" style="height: 120px">
              <div
                v-for="item in dividendBars"
                :key="`${item.year}-${item.period}`"
                class="flex-1 flex flex-col items-center gap-1 cursor-pointer group"
              >
                <div class="font-mono text-[8px] text-accent opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {{ item.cash.toFixed(2) }}
                </div>
                <div
                  class="w-full rounded-t-sm bg-accent/60 group-hover:bg-accent transition-colors"
                  :style="{ height: `${item.heightPct}%` }"
                />
                <div class="font-mono text-[8px] text-content-faint rotate-[-45deg] origin-top-left translate-y-3 whitespace-nowrap">
                  {{ item.label }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 填息進度 -->
        <div v-if="fillProgress" class="bg-surface-2 border border-border rounded-[var(--radius)] p-5 space-y-3">
          <div class="flex items-center gap-3">
            <span class="font-mono text-xs text-content-soft uppercase tracking-widest">填息進度</span>
            <Chip :pt="{ root: { style: { color: fillProgress.filled ? '#22c55e' : '#f59e0b', background: fillProgress.filled ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)' } } }">{{ fillProgress.filled ? '已填息' : `第 ${fillProgress.daysSinceEx} 日` }}</Chip>
          </div>

          <!-- 進度條 -->
          <div class="space-y-1">
            <div class="flex justify-between font-mono text-[11px] text-content-faint">
              <span>除息日 {{ fmtDate(fillProgress.exDate) }}</span>
              <span>{{ fillProgress.progressPct }}%</span>
            </div>
            <div class="h-2 bg-surface-3 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-700"
                :style="{
                  width: `${fillProgress.progressPct}%`,
                  background: fillProgress.progressPct >= 100 ? '#22c55e' : 'var(--accent)',
                }"
              />
            </div>
            <div class="flex justify-between font-mono text-[10px] text-content-faint">
              <span>除息參考價 {{ fillProgress.exPrice?.toFixed(2) }}</span>
              <span>目標 {{ fillProgress.targetPrice?.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <!-- 同業比較 -->
        <div v-if="peers.length" class="bg-surface-2 border border-border rounded-[var(--radius)] overflow-hidden">
          <div class="px-5 py-3 border-b border-border">
            <span class="font-mono text-xs text-content-soft uppercase tracking-widest">同業比較</span>
          </div>
          <div class="divide-y divide-border">
            <div
              v-for="peer in peers"
              :key="peer.code"
              :class="[
                'flex items-center gap-4 px-5 py-2.5 transition-colors cursor-pointer',
                peer.code === code ? 'bg-accent/5' : 'hover:bg-surface-3',
              ]"
              @click="peer.code !== code && router.push(`/stock/${peer.code}`)"
            >
              <div class="w-[52px] font-mono text-[11px]" :class="peer.code === code ? 'text-accent' : 'text-content-soft'">
                {{ peer.code }}
              </div>
              <div class="flex-1 text-[13px] text-content">{{ peer.name }}</div>
              <div class="font-mono text-[12px] text-content w-[72px] text-right">{{ peer.price?.toFixed(2) ?? '—' }}</div>
              <div class="font-mono text-[12px] text-accent w-[56px] text-right">{{ peer.yieldPct?.toFixed(1) ?? '—' }}%</div>
              <div class="font-mono text-[11px] text-content-faint w-[80px] text-right">
                {{ peer.marketCap ? formatCap(Number(peer.marketCap)) : '—' }}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <div v-else class="flex items-center justify-center h-full">
      <div class="text-center space-y-2">
        <div class="font-mono text-2xl text-content-faint">{{ code }}</div>
        <div class="font-mono text-sm text-content-faint">找不到此股票</div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import TvChart from '@/components/chart/TvChart.vue'
import Chip from 'primevue/chip'
import ThemedIcon from '@/components/icons/ThemedIcon.vue'
import { stockApi } from '@/services/api/stock'
import type { StockDetail, Dividend, OhlcvPoint } from '@/types'

const route = useRoute()
const router = useRouter()

const RANGES = ['1M', '3M', '6M', '1Y', 'MAX']
const FREQ_LABEL: Record<string, string> = {
  monthly: '月配',
  quarterly: '季配',
  'semi-annual': '半年配',
  annual: '年配',
}

interface PeerItem {
  code: string
  name: string
  price: number
  yieldPct: number
  marketCap: number | bigint | null
}

interface FillProgress {
  exDate: string
  divAmount: number
  exPrice: number
  targetPrice: number
  currentPrice: number
  progressPct: number
  daysSinceEx: number
  filled: boolean
  fillDays: number | null
}

const code = computed<string>(() => route.params.code as string)
const activeRange = ref<string>('6M')

const stock = ref<(StockDetail & { streak: number; annualCash: number; yieldPct: number }) | null>(null)
const dividends = ref<Dividend[]>([])
const prices = ref<OhlcvPoint[]>([])
const twseClosedDates = ref<string[]>([])
const pricesLoading = ref<boolean>(false)
const peers = ref<PeerItem[]>([])
const fillProgress = ref<FillProgress | null>(null)
const loading = ref<boolean>(true)

const latestDiv = computed<Dividend | null>(() => dividends.value.at(-1) ?? null)

/** 除息日字串陣列（供 TvChart 標記使用） */
const exDateStrings = computed<string[]>(() =>
  dividends.value
    .map((d) => d.exDate)
    .filter((d): d is string => !!d)
    .map((d) => d.slice(0, 10)),
)

/** KPI 6格資料 */
const kpiItems = computed<{ label: string; value: string; color?: string }[]>(() => {
  const div = latestDiv.value
  return [
    { label: '本次配息', value: div ? `${div.cash.toFixed(2)} 元` : '—', color: 'var(--accent)' },
    { label: '殖利率', value: stock.value ? `${stock.value.yieldPct.toFixed(2)}%` : '—', color: 'var(--accent)' },
    { label: '除息日', value: div?.exDate ? fmtDate(div.exDate) : '—' },
    { label: '發放日', value: div?.payDate ? fmtDate(div.payDate) : '—' },
    { label: '平均填息', value: fillProgress.value?.fillDays ? `${fillProgress.value.fillDays} 天` : '—' },
    { label: '連續配息', value: stock.value ? `${stock.value.streak} 年` : '—', color: '#a855f7' },
  ]
})

/** 配息柱狀圖資料 */
const dividendBars = computed<{ year: number; period: number; cash: number; label: string; heightPct: number }[]>(() => {
  const recent = dividends.value.slice(-40)
  const maxCash = Math.max(...recent.map((d) => d.cash), 0.01)
  return recent.map((d) => ({
    year: d.year,
    period: d.period,
    cash: d.cash,
    label: `${d.year}Q${d.period}`,
    heightPct: (d.cash / maxCash) * 100,
  }))
})

/**
 * 格式化日期為 MM/DD
 * @param d 日期字串或物件
 */
const fmtDate = (d: string | Date | null | undefined): string => {
  if (!d) return '—'
  const dt = new Date(d as string)
  return `${dt.getMonth() + 1}/${dt.getDate()}`
}

/**
 * 格式化市值為億/兆
 * @param cap 市值數字（元）
 */
const formatCap = (cap: number): string => {
  if (cap >= 1e12) return `${(cap / 1e12).toFixed(1)} 兆`
  if (cap >= 1e8) return `${(cap / 1e8).toFixed(0)} 億`
  return `${cap}`
}

/**
 * 從股價列抽取涉及年份
 * @param rows K 線列
 * @returns 年份陣列（遞增且去重）
 */
const extractYearsFromCandles = (rows: OhlcvPoint[]): number[] =>
  [...new Set(
    rows
      .map((row) => Number.parseInt(String(row.date).slice(0, 4), 10))
      .filter((y) => Number.isFinite(y) && y >= 1990 && y <= 2999),
  )].sort((a, b) => a - b)

/**
 * 載入對應年度 TWSE 休市日期
 * @param rows K 線列
 * @returns Promise<void>
 */
const loadTwseClosedDates = async (rows: OhlcvPoint[]): Promise<void> => {
  const years = extractYearsFromCandles(rows)
  if (!years.length) {
    twseClosedDates.value = []
    return
  }
  const closedByYear = await Promise.all(
    years.map((y) => stockApi.getTwseClosedDates(y)),
  )
  twseClosedDates.value = [...new Set(closedByYear.flat())]
}

/** 載入個股全部資料 */
const loadAll = async (): Promise<void> => {
  loading.value = true
  try {
    const [detailRes, divRes, priceRes, peerRes, fillRes] = await Promise.allSettled([
      stockApi.getDetail(code.value),
      stockApi.getDividends(code.value),
      stockApi.getPrice(code.value, activeRange.value),
      stockApi.getPeers(code.value),
      stockApi.getFillProgress(code.value),
    ])

    if (detailRes.status === 'fulfilled') stock.value = detailRes.value.data as typeof stock.value
    if (divRes.status === 'fulfilled') dividends.value = divRes.value.data
    if (priceRes.status === 'fulfilled') {
      prices.value = priceRes.value.data
      await loadTwseClosedDates(prices.value)
    } else {
      twseClosedDates.value = []
    }
    if (peerRes.status === 'fulfilled') peers.value = peerRes.value.data as unknown as PeerItem[]
    if (fillRes.status === 'fulfilled') fillProgress.value = fillRes.value.data as unknown as FillProgress
  } finally {
    loading.value = false
  }
}

/** 切換時間範圍時重新載入股價 */
const loadPrices = async (): Promise<void> => {
  pricesLoading.value = true
  try {
    const res = await stockApi.getPrice(code.value, activeRange.value)
    prices.value = res.data
    await loadTwseClosedDates(prices.value)
  } catch {
    prices.value = []
    twseClosedDates.value = []
  } finally {
    pricesLoading.value = false
  }
}

watch(activeRange, loadPrices)
watch(code, loadAll)
onMounted(loadAll)
</script>
