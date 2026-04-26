<template>
  <AppLayout :breadcrumbs="['除息行事曆']">
    <div class="flex h-full overflow-hidden">

      <!-- 側欄：篩選 -->
      <aside class="w-[220px] shrink-0 border-r border-border overflow-y-auto p-4 space-y-5">
        <div class="text-[10px] font-mono text-content-faint uppercase tracking-widest">篩選</div>

        <!-- 僅自選股 -->
        <div class="flex items-center justify-between">
          <span class="text-[12px] text-content-soft">僅自選股</span>
          <UToggle v-model="filters.watchlistOnly" />
        </div>

        <!-- 頻率 -->
        <div class="space-y-1.5">
          <div class="text-[10px] font-mono text-content-faint uppercase tracking-widest">配息頻率</div>
          <div class="flex flex-col gap-1">
            <button
              v-for="f in FREQ_OPTIONS"
              :key="f.value"
              :class="[
                'text-left px-2.5 py-1 rounded-[6px] text-[12px] font-mono transition-colors',
                filters.freq === f.value
                  ? 'bg-accent/15 text-accent'
                  : 'text-content-soft hover:bg-surface-3',
              ]"
              @click="filters.freq = filters.freq === f.value ? '' : f.value"
            >{{ f.label }}</button>
          </div>
        </div>

        <!-- 殖利率門檻 -->
        <div class="space-y-2">
          <div class="text-[10px] font-mono text-content-faint uppercase tracking-widest">
            殖利率 ≥ {{ filters.yieldGt }}%
          </div>
          <input
            v-model.number="filters.yieldGt"
            type="range"
            min="0"
            max="15"
            step="0.5"
            class="w-full accent-[var(--accent)]"
          />
        </div>

        <!-- 圖例 -->
        <div class="space-y-2 pt-2 border-t border-border">
          <div class="text-[10px] font-mono text-content-faint uppercase tracking-widest">圖例</div>
          <div v-for="leg in LEGEND" :key="leg.label" class="flex items-center gap-2">
            <div class="w-2.5 h-2.5 rounded-sm" :style="{ background: leg.color }" />
            <span class="text-[11px] text-content-faint font-mono">{{ leg.label }}</span>
          </div>
        </div>
      </aside>

      <!-- 主內容 -->
      <div class="flex-1 flex flex-col overflow-hidden">

        <!-- 頂欄：月份導覽 -->
        <div class="flex items-center gap-3 px-5 py-3 border-b border-border shrink-0">
          <button
            class="w-7 h-7 rounded-[6px] bg-surface-2 flex items-center justify-center text-content-soft hover:text-content transition-colors"
            @click="prevMonth"
          >&lt;</button>

          <span class="font-mono text-base font-semibold text-content min-w-[120px] text-center">
            {{ year }} 年 {{ month }} 月
          </span>

          <button
            class="w-7 h-7 rounded-[6px] bg-surface-2 flex items-center justify-center text-content-soft hover:text-content transition-colors"
            @click="nextMonth"
          >&gt;</button>

          <button
            class="ml-2 px-3 py-1 text-[11px] font-mono bg-surface-2 rounded-[6px] text-content-soft hover:text-content transition-colors"
            @click="goToday"
          >今天</button>

          <div class="flex-1" />

          <div v-if="loading" class="font-mono text-[11px] text-content-faint">載入中…</div>
        </div>

        <!-- 星期標題列 -->
        <div class="grid grid-cols-7 border-b border-border shrink-0">
          <div
            v-for="d in WEEKDAYS"
            :key="d"
            class="py-2 text-center font-mono text-[10px] text-content-faint uppercase tracking-widest"
          >{{ d }}</div>
        </div>

        <!-- 月曆格子 -->
        <div class="flex-1 overflow-auto">
          <div class="grid grid-cols-7 h-full" style="grid-auto-rows: minmax(100px, 1fr)">
            <div
              v-for="cell in calendarCells"
              :key="cell.key"
              :class="[
                'border-r border-b border-border p-1.5 flex flex-col gap-0.5 min-h-[100px]',
                !cell.currentMonth && 'opacity-30',
                cell.isToday && 'bg-accent/5 ring-1 ring-inset ring-accent/30',
              ]"
            >
              <!-- 日期數字 -->
              <div class="flex items-center gap-1 mb-0.5">
                <span
                  :class="[
                    'font-mono text-[11px] w-5 h-5 flex items-center justify-center rounded-full',
                    cell.isToday
                      ? 'bg-accent text-surface font-semibold'
                      : 'text-content-soft',
                  ]"
                >{{ cell.day }}</span>
                <span v-if="cell.isToday" class="font-mono text-[9px] text-accent uppercase tracking-widest">今</span>
              </div>

              <!-- 事件晶片 -->
              <template v-if="cell.events.length">
                <div
                  v-for="ev in cell.events.slice(0, 3)"
                  :key="ev.id"
                  :class="[
                    'flex items-center gap-1 px-1 py-0.5 rounded-[3px] text-[9px] font-mono truncate cursor-pointer',
                    ev.isWatchlist ? 'bg-blue-500/15 text-blue-400' : 'bg-surface-3 text-content-soft',
                  ]"
                  :style="{ borderLeft: `2px solid ${eventColor(ev)}` }"
                  @click="selectedEvent = ev"
                >
                  <span class="truncate">{{ ev.stockCode }} {{ ev.stockName }}</span>
                  <span class="shrink-0 text-accent">{{ ev.amount.toFixed(1) }}</span>
                </div>
                <div
                  v-if="cell.events.length > 3"
                  class="font-mono text-[9px] text-content-faint px-1 cursor-pointer hover:text-content"
                  @click="expandedCell = cell.key"
                >+{{ cell.events.length - 3 }} 更多</div>
              </template>
            </div>
          </div>
        </div>

        <!-- 底部統計列 -->
        <div class="shrink-0 border-t border-border px-5 py-2.5 flex items-center gap-6 font-mono text-[11px] text-content-faint">
          <span>本月 <span class="text-content">{{ stats.total }}</span> 檔</span>
          <span>自選股 <span class="text-accent">{{ stats.watchlist }}</span> 檔</span>
          <span>預計發放 <span class="text-content">{{ stats.payCount }}</span> 筆</span>
          <div class="flex-1" />
          <span v-if="stats.busiestDay">最密集：{{ stats.busiestDay }}</span>
        </div>
      </div>
    </div>

    <!-- 事件詳情浮層 -->
    <Transition name="fade">
      <div
        v-if="selectedEvent"
        class="fixed inset-0 z-50 flex items-center justify-center"
        @click.self="selectedEvent = null"
      >
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <div class="relative bg-surface-2 border border-border-strong rounded-[14px] p-5 w-[320px] space-y-4 shadow-2xl">
          <div class="flex items-start justify-between">
            <div>
              <div class="font-mono text-xs text-content-faint">{{ selectedEvent.stockCode }}</div>
              <div class="text-base font-semibold text-content">{{ selectedEvent.stockName }}</div>
            </div>
            <UChip :color="'accent'" :bg="'rgba(34,197,94,0.12)'">{{ selectedEvent.freq }}</UChip>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-surface-3 rounded-[8px] p-3">
              <div class="text-[10px] font-mono text-content-faint mb-1">配息金額</div>
              <div class="font-mono text-lg font-semibold text-accent">{{ selectedEvent.amount.toFixed(2) }} 元</div>
            </div>
            <div class="bg-surface-3 rounded-[8px] p-3">
              <div class="text-[10px] font-mono text-content-faint mb-1">除息日</div>
              <div class="font-mono text-sm text-content">{{ fmtDate(selectedEvent.exDate) }}</div>
            </div>
          </div>
          <div class="flex gap-2">
            <button
              class="flex-1 py-2 text-[12px] font-mono bg-surface-3 rounded-[8px] text-content-soft hover:text-content transition-colors"
              @click="selectedEvent = null"
            >關閉</button>
            <RouterLink
              :to="`/stock/${selectedEvent.stockCode}`"
              class="flex-1 py-2 text-[12px] font-mono bg-accent/15 rounded-[8px] text-accent text-center hover:bg-accent/25 transition-colors"
              @click="selectedEvent = null"
            >查看個股 →</RouterLink>
          </div>
        </div>
      </div>
    </Transition>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import UToggle from '@/components/ui/UToggle.vue'
import UChip from '@/components/ui/UChip.vue'
import { calendarApi } from '@/api/calendar'
import type { CalendarEvent } from '@/types'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']
const FREQ_OPTIONS = [
  { label: '月配', value: 'monthly' },
  { label: '季配', value: 'quarterly' },
  { label: '半年配', value: 'semi-annual' },
  { label: '年配', value: 'annual' },
]
const LEGEND = [
  { label: '除息日', color: '#22c55e' },
  { label: '發放日', color: '#f59e0b' },
  { label: '自選股', color: '#3b82f6' },
]

const today = new Date()
const year = ref<number>(today.getFullYear())
const month = ref<number>(today.getMonth() + 1)
const events = ref<CalendarEvent[]>([])
const loading = ref<boolean>(false)
const selectedEvent = ref<CalendarEvent | null>(null)
const expandedCell = ref<string | null>(null)

const filters = ref<{
  watchlistOnly: boolean
  freq: string
  yieldGt: number
}>({
  watchlistOnly: false,
  freq: '',
  yieldGt: 0,
})

/**
 * 決定事件的左側邊框顏色
 * @param ev 行事曆事件
 * @returns 色碼字串
 */
const eventColor = (ev: CalendarEvent): string => {
  if (ev.isWatchlist) return '#3b82f6'
  if (ev.type === 'payment') return '#f59e0b'
  return '#22c55e'
}

/**
 * 格式化日期為 MM/DD
 * @param d 日期字串或 null
 */
const fmtDate = (d: string | null | undefined): string => {
  if (!d) return '—'
  const dt = new Date(d)
  return `${dt.getMonth() + 1}/${dt.getDate()}`
}

/** 產生當月行事曆格子（含前後月份補位） */
const calendarCells = computed<{
  key: string
  day: number
  date: Date
  currentMonth: boolean
  isToday: boolean
  events: CalendarEvent[]
}[]>(() => {
  const firstDay = new Date(year.value, month.value - 1, 1)
  const lastDay = new Date(year.value, month.value, 0)
  const cells = []

  // 前月補位
  for (let i = firstDay.getDay(); i > 0; i--) {
    const d = new Date(firstDay)
    d.setDate(d.getDate() - i)
    cells.push(makeCell(d, false))
  }

  // 當月
  for (let d = 1; d <= lastDay.getDate(); d++) {
    cells.push(makeCell(new Date(year.value, month.value - 1, d), true))
  }

  // 後月補位（補滿 6 列）
  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++) {
    cells.push(makeCell(new Date(year.value, month.value, d), false))
  }

  return cells
})

/**
 * 建立單一格子資料
 * @param date 日期
 * @param currentMonth 是否屬於當月
 */
const makeCell = (date: Date, currentMonth: boolean) => {
  const key = date.toISOString().slice(0, 10)
  const isToday =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()

  const dayEvents = events.value.filter((ev) => {
    const exDate = ev.exDate ? new Date(ev.exDate).toISOString().slice(0, 10) : null
    const payDate = ev.payDate ? new Date(ev.payDate).toISOString().slice(0, 10) : null
    return exDate === key || payDate === key
  })

  return { key, day: date.getDate(), date, currentMonth, isToday, events: dayEvents }
}

/** 月份統計資料 */
const stats = computed<{
  total: number
  watchlist: number
  payCount: number
  busiestDay: string | null
}>(() => {
  const stockSet = new Set(events.value.map((e) => e.stockCode))
  const watchlistSet = new Set(events.value.filter((e) => e.isWatchlist).map((e) => e.stockCode))
  const payCount = events.value.filter((e) => e.type === 'payment').length

  // 找最密集日（依 exDate 分組）
  const countByDay: Record<string, number> = {}
  events.value.forEach((e) => {
    if (e.exDate) {
      const k = new Date(e.exDate).toISOString().slice(0, 10)
      countByDay[k] = (countByDay[k] ?? 0) + 1
    }
  })
  const busiestEntry = Object.entries(countByDay).sort((a, b) => b[1] - a[1])[0]
  const busiestDay = busiestEntry
    ? `${busiestEntry[0].slice(5)} (${busiestEntry[1]} 檔)`
    : null

  return { total: stockSet.size, watchlist: watchlistSet.size, payCount, busiestDay }
})

/** 載入行事曆資料 */
const loadEvents = async (): Promise<void> => {
  loading.value = true
  try {
    const res = await calendarApi.getMonthEvents(year.value, month.value, {
      watchlistOnly: filters.value.watchlistOnly || undefined,
      freq: filters.value.freq || undefined,
      yieldGt: filters.value.yieldGt > 0 ? filters.value.yieldGt : undefined,
    })
    events.value = res.data
  } catch {
    events.value = []
  } finally {
    loading.value = false
  }
}

/** 前往上個月 */
const prevMonth = (): void => {
  if (month.value === 1) {
    year.value -= 1
    month.value = 12
  } else {
    month.value -= 1
  }
}

/** 前往下個月 */
const nextMonth = (): void => {
  if (month.value === 12) {
    year.value += 1
    month.value = 1
  } else {
    month.value += 1
  }
}

/** 回到今天所在月份 */
const goToday = (): void => {
  year.value = today.getFullYear()
  month.value = today.getMonth() + 1
}

watch([year, month, filters], loadEvents, { deep: true })
onMounted(loadEvents)
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
