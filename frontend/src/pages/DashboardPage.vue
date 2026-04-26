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
          icon="$"
          accent="#22c55e"
        />
        <KpiCard
          label="本週除息"
          :value="summary?.weekExDiv.count ?? 0"
          unit="檔"
          :sub="`自選股 ${summary?.weekExDiv.watchlistCount ?? 0} 檔`"
          icon="📅"
          accent="#3b82f6"
        />
        <KpiCard
          label="待填息"
          :value="summary?.pendingFill.count ?? 0"
          unit="檔"
          :sub="summary?.pendingFill.maxDays ? `最長 ${summary.pendingFill.maxDays} 日` : '—'"
          icon="⏳"
          accent="#f59e0b"
        />
        <KpiCard
          label="下次入帳"
          :value="summary?.nextPayout.estimatedAmount ?? 0"
          unit="元"
          :sub="summary?.nextPayout.date || '—'"
          icon="💰"
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
            <span class="font-mono text-sm font-semibold text-content">加權指數</span>
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
            <span class="text-3xl font-mono font-semibold text-content">21,456</span>
            <span class="font-mono text-sm text-up">+123.4</span>
            <span class="font-mono text-xs text-up">+0.58%</span>
          </div>
          <StockChart :width="chartWidth" :height="280" :show-grid="true" :show-crosshair="true" class="w-full" />
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
                  <div class="font-mono text-[10px] text-content-faint">{{ fmtMonth(ev.date) }}</div>
                  <div class="font-mono text-base font-semibold text-content leading-none">{{ fmtDay(ev.date) }}</div>
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
                <SparkLine :series="item.stock?.price ? undefined : undefined" :up="(item.stock?.changePct ?? 0) >= 0" :width="80" :height="28" />
                <div class="w-[72px] text-right">
                  <div class="font-mono text-[12px] text-content">{{ item.stock?.price?.toFixed(2) ?? '—' }}</div>
                  <div :class="['font-mono text-[10px]', (item.stock?.changePct ?? 0) >= 0 ? 'text-up' : 'text-down']">
                    {{ (item.stock?.changePct ?? 0) >= 0 ? '+' : '' }}{{ item.stock?.changePct?.toFixed(2) ?? '0.00' }}%
                  </div>
                </div>
                <div class="w-[56px] text-right">
                  <div class="font-mono text-[10px] text-content-faint">殖利率</div>
                  <div class="font-mono text-[12px] text-accent">
                    {{ item.stock?.latestDividend ? ((item.stock.latestDividend.cash / (item.stock.price || 1)) * 100).toFixed(1) : '—' }}%
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
import { ref, computed, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import StockChart from '@/components/chart/StockChart.vue'
import SparkLine from '@/components/chart/SparkLine.vue'
import UChip from '@/components/ui/UChip.vue'
import KpiCard from '@/components/dashboard/KpiCard.vue'
import { dashboardApi } from '@/api/dashboard'
import { watchlistApi } from '@/api/watchlist'
import type { DashboardSummary, CalendarEvent, WatchlistGroup } from '@/types'

const router = useRouter()
const RANGES = ['1W', '1M', '3M', '6M', '1Y', 'MAX']
const activeRange = ref('6M')
const chartWidth = ref(800)

const summary = ref<DashboardSummary | null>(null)
const upcoming = ref<CalendarEvent[]>([])
const watchlistGroups = ref<WatchlistGroup[]>([])
const watchlistLoading = ref(true)

const today = computed(() => new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' }))

function fmtMonth(d: string) {
  return new Date(d).toLocaleDateString('zh-TW', { month: 'short' })
}
function fmtDay(d: string) {
  return new Date(d).getDate()
}

onMounted(async () => {
  try {
    const [sumRes, upRes, wlRes] = await Promise.all([
      dashboardApi.getSummary(),
      dashboardApi.getUpcoming(7),
      watchlistApi.getAll(),
    ])
    summary.value = sumRes.data
    upcoming.value = upRes.data
    watchlistGroups.value = wlRes.data
  } catch {
    // silently fail — mock data already seeded
  } finally {
    watchlistLoading.value = false
  }
})
</script>
