<template>
  <AppLayout :breadcrumbs="['儀表板']">
    <div class="p-6 space-y-6 max-w-[1400px] mx-auto">

      <!-- KPI 4-card strip -->
      <div class="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          label="今日除息"
          :value="summary?.todayExDiv.count ?? 0"
          unit="檔"
          :sub="summary?.todayExDiv.codes.slice(0, 3).join('・') || '—'"
          icon-name="bolt"
          accent="#22c55e"
        />
        <KpiCard
          label="本週除息"
          :value="summary?.weekExDiv.count ?? 0"
          unit="檔"
          :sub="`自選股 ${summary?.weekExDiv.watchlistCount ?? 0} 檔`"
          icon-name="calendar"
          accent="#3b82f6"
        />
        <KpiCard
          label="待填息"
          :value="summary?.pendingFill.count ?? 0"
          unit="檔"
          :sub="summary?.pendingFill.maxDays ? `最長 ${summary.pendingFill.maxDays} 日` : '—'"
          icon-name="clock"
          accent="#f59e0b"
        />
        <KpiCard
          label="下次入帳"
          :value="summary?.nextPayout.estimatedAmount ?? 0"
          unit="元"
          :sub="summary?.nextPayout.date || '—'"
          icon-name="banknotes"
          accent="#a855f7"
        />
      </div>

      <!-- Accumulated income banner -->
      <div v-if="summary" class="flex items-center gap-4 px-5 py-3 bg-surface-2 border border-border rounded-[var(--radius)]">
        <span class="text-content-faint text-[11px] font-mono uppercase tracking-widest">累積股息收入</span>
        <span class="text-2xl font-mono font-semibold text-accent">
          NT$ {{ summary.accumulatedIncome.toLocaleString() }}
        </span>
        <UChip
          :color="summary.yoyPct >= 0 ? 'up' : 'down'"
          :bg="summary.yoyPct >= 0 ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)'"
        >
          {{ summary.yoyPct >= 0 ? '+' : '' }}{{ summary.yoyPct.toFixed(1) }}% YoY
        </UChip>
        <div class="flex-1" />
        <span class="text-[10px] text-content-faint font-mono">截至 {{ today }}</span>
      </div>

      <!-- Main content: chart + sidebar -->
      <div class="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">

        <!-- Hero stock chart -->
        <div class="bg-surface-2 border border-border rounded-[var(--radius)] overflow-hidden">
          <div class="flex items-center gap-3 px-5 py-4 border-b border-border">
            <template v-if="heroStock">
              <button
                type="button"
                class="text-left font-mono text-sm font-semibold text-content hover:text-accent transition-colors"
                @click="router.push(`/stock/${heroStock.code}`)"
              >
                {{ heroStock.name }}
              </button>
              <span class="text-content-faint font-mono text-xs">{{ heroStock.code }}</span>
              <UChip v-if="heroStock.yieldPct != null" color="accent" bg="rgba(34,197,94,0.12)">
                殖利率 {{ heroStock.yieldPct.toFixed(1) }}%
              </UChip>
            </template>
            <template v-else>
              <span class="font-mono text-sm font-semibold text-content">加權指數</span>
              <span class="text-content-faint font-mono text-xs">TAIEX</span>
              <RouterLink
                to="/watchlist"
                class="ml-2 text-[10px] font-mono text-accent hover:underline"
              >
                加入自選以顯示 Hero 個股
              </RouterLink>
            </template>
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
            <template v-if="heroStock">
              <span class="text-3xl font-mono font-semibold text-content">{{ heroStock.price.toFixed(2) }}</span>
              <span :class="['font-mono text-sm', heroStock.change >= 0 ? 'text-up' : 'text-down']">
                {{ heroStock.change >= 0 ? '+' : '' }}{{ heroStock.change.toFixed(2) }}
              </span>
              <span :class="['font-mono text-xs', heroStock.changePct >= 0 ? 'text-up' : 'text-down']">
                ({{ heroStock.changePct >= 0 ? '+' : '' }}{{ heroStock.changePct.toFixed(2) }}%)
              </span>
            </template>
            <template v-else>
              <span class="text-3xl font-mono font-semibold text-content">21,456</span>
              <span class="font-mono text-sm text-up">+123.4</span>
              <span class="font-mono text-xs text-up">+0.58%</span>
            </template>
          </div>
          <StockChart
            :width="chartWidth"
            :height="280"
            :show-grid="true"
            :show-crosshair="true"
            :series="heroSeriesForChart"
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
                  <div class="font-mono text-[12px] text-accent font-semibold">{{ ev.amount.toFixed(2) }}</div>
                  <div class="font-mono text-[9px] text-content-faint">元/股</div>
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
import StockChart from '@/components/chart/StockChart.vue'
import SparkLine from '@/components/chart/SparkLine.vue'
import UChip from '@/components/ui/UChip.vue'
import KpiCard from '@/components/dashboard/KpiCard.vue'
import { dashboardApi } from '@/api/dashboard'
import { watchlistApi } from '@/api/watchlist'
import { stockApi } from '@/api/stock'
import type { DashboardSummary, CalendarEvent, WatchlistGroup, WatchlistItem, StockDetail } from '@/types'

const router = useRouter()
const RANGES = ['1W', '1M', '3M', '6M', '1Y', 'MAX']
const activeRange = ref('6M')
const chartWidth = ref(800)

const summary = ref<DashboardSummary | null>(null)
const upcoming = ref<CalendarEvent[]>([])
const watchlistGroups = ref<WatchlistGroup[]>([])
const watchlistLoading = ref(true)
const heroStock = ref<StockDetail | null>(null)
const heroCloses = ref<number[]>([])

const heroSeriesForChart = computed<number[] | undefined>(() =>
  heroCloses.value.length >= 2 ? heroCloses.value : undefined,
)

const today = computed(() => new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' }))

function fmtMonth(d: string) {
  return new Date(d).toLocaleDateString('zh-TW', { month: 'short' })
}
function fmtDay(d: string) {
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

const loadHeroPrices = async () => {
  if (!heroStock.value) {
    heroCloses.value = []
    return
  }
  try {
    const res = await stockApi.getPrice(heroStock.value.code, activeRange.value)
    heroCloses.value = res.data.map((p) => p.close)
  } catch {
    heroCloses.value = []
  }
}

watch([heroStock, activeRange], () => {
  void loadHeroPrices()
}, { immediate: true })

onMounted(async () => {
  try {
    const [sumRes, upRes, wlRes, featRes] = await Promise.all([
      dashboardApi.getSummary(),
      dashboardApi.getUpcoming(7),
      watchlistApi.getAll(),
      stockApi.getFeatured(),
    ])
    summary.value = sumRes.data
    upcoming.value = upRes.data
    watchlistGroups.value = wlRes.data
    heroStock.value = featRes.data.featured
  } catch {
    // silently fail — mock data already seeded
  } finally {
    watchlistLoading.value = false
  }
})
</script>
