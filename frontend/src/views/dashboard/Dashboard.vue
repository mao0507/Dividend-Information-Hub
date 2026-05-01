<template>
  <AppLayout :breadcrumbs="['儀表板']">
    <div class="p-6 space-y-6 max-w-[1400px] mx-auto">

      <div
        v-if="summary || summaryLoadFailed"
        data-test="combined-summary-card"
        class="bg-surface-2 border border-border rounded-[var(--radius)] px-5 py-4"
      >
        <div class="flex items-center gap-3">
          <span class="text-content-faint text-[11px] font-mono uppercase tracking-widest">累積股息收入</span>
          <Chip :pt="{ root: { style: {
            color: summary?.yoyPct != null && summary.yoyPct >= 0 ? 'var(--up-color)' : 'var(--down-color)',
            background: summary?.yoyPct != null && summary.yoyPct >= 0 ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)',
          } } }">
            {{ accumulatedIncomeYoyDisplay }}
          </Chip>
          <div class="flex-1" />
          <RouterLink to="/holdings" class="font-mono text-[11px] text-accent hover:underline">
            前往持股管理 →
          </RouterLink>
        </div>
        <div class="mt-3 flex items-end gap-8">
          <div class="min-w-[220px]">
            <div class="text-content-faint text-[10px] font-mono uppercase tracking-widest">累積配息</div>
            <div class="text-2xl font-mono font-semibold text-accent">{{ accumulatedIncomeDisplay }}</div>
            <div class="text-[10px] text-content-faint font-mono">截至 {{ accumulatedIncomeAsOfDisplay }}</div>
          </div>
          <div class="min-w-[220px]">
            <div class="text-content-faint text-[10px] font-mono uppercase tracking-widest">總投資金額</div>
            <div class="text-xl font-mono font-semibold text-content">{{ totalInvestedDisplay }}</div>
          </div>
        </div>
      </div>

      <!-- Main content: chart + sidebar -->
      <div class="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">

        <!-- TAIEX index chart -->
        <div class="bg-surface-2 border border-border rounded-[var(--radius)] overflow-hidden">
          <div class="flex items-center gap-3 px-5 py-4 border-b border-border">
            <span class="font-mono text-sm font-semibold text-content">台灣加權指數</span>
            <span class="text-content-faint font-mono text-xs">TAIEX</span>
            <div class="flex-1" />
            <div class="flex gap-1">
              <button
                v-for="r in RANGES"
                :key="r"
                :class="['px-2 py-0.5 font-mono text-[10px] rounded transition-colors', activeRange === r ? 'bg-accent/20 text-accent' : 'text-content-soft hover:text-content']"
                @click="activeRange = r"
              >{{ r }}</button>
            </div>
          </div>
          <div class="px-5 py-3 flex items-baseline gap-2">
            <span class="text-3xl font-mono font-semibold text-content">
              {{ taiexLatest ? taiexLatest.close.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '--' }}
            </span>
            <span v-if="taiexLatest" :class="['font-mono text-sm', taiexLatest.change >= 0 ? 'text-up' : 'text-down']">
              {{ taiexLatest.change >= 0 ? '+' : '' }}{{ taiexLatest.change.toFixed(2) }}
            </span>
            <span v-if="taiexLatest" :class="['font-mono text-xs', taiexLatest.changePct >= 0 ? 'text-up' : 'text-down']">
              ({{ taiexLatest.changePct >= 0 ? '+' : '' }}{{ taiexLatest.changePct.toFixed(2) }}%)
            </span>
          </div>
          <TvChart
            :candles="taiexCandles"
            :twse-closed-dates="taiexClosedDates"
            :loading="taiexLoading"
            :height="280"
            :line-mode="true"
            :show-volume="false"
            class="w-full"
          />
        </div>

        <!-- Right sidebar: upcoming ex-div -->
        <div class="bg-surface-2 border border-border rounded-[var(--radius)] overflow-hidden">
          <div class="px-4 py-4 border-b border-border">
            <span class="font-mono text-xs font-semibold text-content-soft uppercase tracking-widest">7 日除息行事曆</span>
          </div>
          <div class="divide-y divide-border">
            <template v-if="upcoming.length">
              <div
                v-for="ev in upcoming"
                :key="`${ev.date}-${ev.stockCode}`"
                class="px-4 py-2.5 flex items-center gap-3 hover:bg-surface-3 transition-colors cursor-pointer"
                @click="router.push(`/stock/${ev.stockCode}`)"
              >
                <div class="text-center min-w-[36px]">
                  <div class="font-mono text-[10px] text-content-faint">{{ fmtMonth(ev.date ?? ev.exDate ?? '') }}</div>
                  <div class="font-mono text-base font-semibold text-content leading-none">{{ fmtDay(ev.date ?? ev.exDate ?? '') }}</div>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-[12px] font-medium text-content truncate">{{ ev.stockName }}</div>
                  <div class="font-mono text-[10px] text-content-faint">{{ ev.stockCode }} · {{ ev.type === 'exDiv' ? '除息' : '入帳' }}</div>
                </div>
                <div class="text-right">
                  <div class="font-mono text-[12px] text-accent font-semibold">
                    {{ ev.amount > 0 ? ev.amount.toFixed(2) : '尚未公布' }}
                  </div>
                  <div v-if="ev.amount > 0" class="font-mono text-[9px] text-content-faint">元/股</div>
                </div>
              </div>
            </template>
            <div v-else class="px-4 py-8 text-center text-content-faint text-[12px] font-mono">
              近 7 日無除息事件
            </div>
          </div>
        </div>
      </div>

      <!-- Watchlist summary -->
      <div class="bg-surface-2 border border-border rounded-[var(--radius)] overflow-hidden">
        <div class="px-5 py-4 border-b border-border flex items-center gap-3">
          <span class="font-mono text-xs font-semibold text-content-soft uppercase tracking-widest">自選股</span>
          <div class="flex-1" />
          <RouterLink to="/watchlist" class="font-mono text-[10px] text-content-faint hover:text-content transition-colors">
            管理 →
          </RouterLink>
        </div>
        <div v-if="watchlistLoading" class="px-5 py-6 text-center text-content-faint text-xs font-mono">載入中…</div>
        <template v-else>
          <div
            v-for="group in watchlistGroups"
            :key="group.id"
          >
            <div class="px-5 py-2 bg-surface-3 flex items-center gap-2">
              <div class="w-2 h-2 rounded-full" :style="{ background: group.color }" />
              <span class="font-mono text-[10px] text-content-faint uppercase tracking-widest">{{ group.name }}</span>
              <span class="font-mono text-[10px] text-content-faint ml-auto">{{ group.items.length }} 檔</span>
            </div>
            <div class="divide-y divide-border">
              <div
                v-for="item in group.items"
                :key="item.id"
                class="px-5 py-2.5 flex items-center gap-4 hover:bg-surface-3 transition-colors cursor-pointer"
                @click="router.push(`/stock/${item.stockCode}`)"
              >
                <div class="w-[52px] font-mono text-[11px] text-content-soft">{{ item.stockCode }}</div>
                <div class="flex-1 text-[13px] text-content truncate">{{ item.stock?.name ?? '—' }}</div>
                <SparkLine
                  :series="dashSpark(item)"
                  :up="dashChgPct(item) >= 0"
                  :width="80"
                  :height="28"
                />
                <div class="w-[72px] text-right">
                  <div class="font-mono text-[12px] text-content">
                    {{ dashPrice(item) > 0 ? dashPrice(item).toFixed(2) : '—' }}
                  </div>
                  <div :class="['font-mono text-[10px]', dashChgPct(item) >= 0 ? 'text-up' : 'text-down']">
                    {{ dashChgPct(item) >= 0 ? '+' : '' }}{{ dashChgPct(item).toFixed(2) }}%
                  </div>
                </div>
                <div class="w-[56px] text-right">
                  <div class="font-mono text-[10px] text-content-faint">殖利率</div>
                  <div class="font-mono text-[12px] text-accent">
                    {{ dashYield(item) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-if="!watchlistGroups.length" class="px-5 py-8 text-center text-content-faint text-xs font-mono">
            尚無自選股 — <RouterLink to="/watchlist" class="text-accent underline">新增</RouterLink>
          </div>
        </template>
      </div>

    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import TvChart from '@/components/chart/TvChart.vue'
import SparkLine from '@/components/chart/SparkLine.vue'
import Chip from 'primevue/chip'
import { dashboardApi } from '@/services/api/dashboard'
import { watchlistApi } from '@/services/api/watchlist'
import { stockApi } from '@/services/api/stock'
import type {
  DashboardSummary,
  CalendarEvent,
  WatchlistGroup,
  WatchlistItem,
  OhlcvPoint,
} from '@/types'
type DashboardCardState = 'ready' | 'empty' | 'stale' | 'error'

const router = useRouter()
const RANGES = ['1W', '1M', '3M', '6M', '1Y', 'MAX']
const activeRange = ref<string>('6M')

const summary = ref<DashboardSummary | null>(null)
const upcoming = ref<CalendarEvent[]>([])
const watchlistGroups = ref<WatchlistGroup[]>([])
const watchlistLoading = ref<boolean>(true)
const taiexCandles = ref<OhlcvPoint[]>([])
const taiexClosedDates = ref<string[]>([])
const taiexLoading = ref<boolean>(false)
const summaryLoadFailed = ref<boolean>(false)

const today = computed<string>(() => new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' }))
const summaryAsOf = computed<string | null>(() =>
  summary.value?.asOf
    ? new Date(summary.value.asOf).toLocaleDateString('zh-TW')
    : null,
)
const accumulatedIncomeState = computed<DashboardCardState>(() => {
  if (summaryLoadFailed.value) return 'error'
  return summary.value?.accumulatedIncomeState ?? 'empty'
})
const accumulatedIncomeDisplay = computed<string>(() => {
  if (accumulatedIncomeState.value !== 'ready') return '--'
  return Number.isFinite(summary.value?.accumulatedIncome)
    ? `NT$ ${Number(summary.value?.accumulatedIncome).toLocaleString()}`
    : '--'
})
const accumulatedIncomeYoyDisplay = computed<string>(() => {
  if (accumulatedIncomeState.value !== 'ready') return '資料同步中'
  const yoy = summary.value?.yoyPct
  if (!Number.isFinite(yoy)) return '資料時間未知'
  const v = Number(yoy)
  return `${v >= 0 ? '+' : ''}${v.toFixed(1)}% YoY`
})
const accumulatedIncomeAsOfDisplay = computed<string>(() =>
  summaryAsOf.value ?? today.value,
)
const totalInvestedDisplay = computed<string>(() =>
  `NT$ ${(summary.value?.totalInvestedAmount ?? 0).toLocaleString()}`,
)

const taiexLatest = computed<{ close: number; change: number; changePct: number } | null>(() => {
  const candles = taiexCandles.value
  if (!candles.length) return null
  const last = candles[candles.length - 1]
  const prev = candles.length > 1 ? candles[candles.length - 2] : null
  const change = prev ? last.close - prev.close : 0
  const changePct = prev && prev.close > 0 ? (change / prev.close) * 100 : 0
  return {
    close: last.close,
    change: parseFloat(change.toFixed(2)),
    changePct: parseFloat(changePct.toFixed(2)),
  }
})

/**
 * 格式化月份字串。
 * @param d 日期字串
 * @returns 月份文字
 */
const fmtMonth = (d: string): string => {
  return new Date(d).toLocaleDateString('zh-TW', { month: 'short' })
}
/**
 * 格式化日期為當月日數。
 * @param d 日期字串
 * @returns 日期數字
 */
const fmtDay = (d: string): number => {
  return new Date(d).getDate()
}

const dashPrice = (item: WatchlistItem): number => item.stock.prices?.[0]?.close ?? 0

const dashChgPct = (item: WatchlistItem): number => {
  const a = item.stock.prices?.[0]?.close ?? 0
  const b = item.stock.prices?.[1]?.close ?? a
  if (b <= 0) return 0
  return parseFloat((((a - b) / b) * 100).toFixed(2))
}

const dashSpark = (item: WatchlistItem): number[] | undefined => {
  const c = item.stock.prices?.map((p) => p.close) ?? []
  return c.length >= 2 ? [...c].reverse() : undefined
}

const dashYield = (item: WatchlistItem): string => {
  const px = dashPrice(item)
  const cash = item.stock.dividends?.[0]?.cash
  if (!cash || px <= 0) return '—'
  return `${((cash / px) * 100).toFixed(1)}%`
}

/**
 * 載入 TAIEX K 線資料與對應年份休市日
 * @returns Promise<void>
 */
const loadTaiexSeries = async (): Promise<void> => {
  taiexLoading.value = true
  try {
    const res = await stockApi.getPriceSeries('TAIEX', activeRange.value)
    taiexCandles.value = res.data.data
    const years = [...new Set(
      res.data.data
        .map((row) => Number.parseInt(String(row.date).slice(0, 4), 10))
        .filter((y) => Number.isFinite(y) && y >= 1990 && y <= 2999),
    )].sort((a, b) => a - b)
    try {
      const closedByYear = await Promise.all(years.map((y) => stockApi.getTwseClosedDates(y)))
      taiexClosedDates.value = [...new Set(closedByYear.flat())]
    } catch {
      taiexClosedDates.value = []
    }
  } catch {
    taiexCandles.value = []
    taiexClosedDates.value = []
  } finally {
    taiexLoading.value = false
  }
}

watch(activeRange, () => {
  void loadTaiexSeries()
})

onMounted(async () => {
  void loadTaiexSeries()
  try {
    const [sumRes, upRes, wlRes] = await Promise.all([
      dashboardApi.getSummary(),
      dashboardApi.getUpcoming(7),
      watchlistApi.getAll(),
    ])
    summary.value = sumRes.data
    upcoming.value = upRes.data
    watchlistGroups.value = wlRes.data
    summaryLoadFailed.value = false
  } catch {
    summaryLoadFailed.value = true
  } finally {
    watchlistLoading.value = false
  }
})
</script>
