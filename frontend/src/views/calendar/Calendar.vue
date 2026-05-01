<template>
  <AppLayout :breadcrumbs="['除息行事曆']">
    <div class="flex h-full overflow-hidden">

      <!-- 側欄：篩選 -->
      <aside class="w-[220px] shrink-0 border-r border-border overflow-y-auto p-4 space-y-5">
        <div class="text-[10px] font-mono text-content-faint uppercase tracking-widest">篩選</div>

        <!-- 僅自選股 -->
        <div class="flex items-center justify-between">
          <span class="text-[12px] text-content-soft">僅自選股</span>
          <ToggleSwitch v-model="filters.watchlistOnly" />
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
            殖利率 ≥ {{ pendingYieldGt }}%
          </div>
          <input
            type="range"
            :value="pendingYieldGt"
            min="0"
            max="15"
            step="0.5"
            class="w-full accent-[var(--accent)]"
            @input="pendingYieldGt = Number(($event.target as HTMLInputElement).value)"
            @change="filters.yieldGt = pendingYieldGt"
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
                  v-for="ev in cell.events.slice(0, 2)"
                  :key="ev.id"
                  :class="[
                    'flex items-center gap-1 px-1 py-0.5 rounded-[3px] text-[9px] font-mono min-w-0 cursor-pointer',
                    ev.isWatchlist ? 'bg-blue-500/15 text-blue-400' : 'bg-surface-3 text-content-soft',
                  ]"
                  :style="{ borderLeft: `2px solid ${eventColor(ev)}` }"
                  @click="selectedEvent = ev"
                >
                  <span class="flex-1 truncate">{{ ev.stockCode }} {{ ev.stockName }}</span>
                  <span class="ml-1 text-accent">{{ amountLabel(ev) }}</span>
                </div>
                <button
                  v-if="cell.events.length > 2"
                  class="font-mono text-[9px] text-accent px-1 hover:underline text-left"
                  @click.stop="overflowDialogDate = cell.key"
                >+{{ cell.events.length - 2 }} 更多</button>
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

    <!-- 溢出除息清單 Dialog -->
    <Dialog
      v-model:visible="overflowDialogVisible"
      :header="overflowDialogTitle"
      modal
      :style="{ width: '420px', minWidth: '360px' }"
    >
      <table class="w-full text-[12px]">
        <thead>
          <tr class="border-b border-border text-content-faint text-[10px] uppercase tracking-widest">
            <th class="py-1.5 text-left font-normal w-[60px]">代號</th>
            <th class="py-1.5 text-left font-normal">名稱</th>
            <th class="py-1.5 text-left font-normal w-[60px]">頻率</th>
            <th class="py-1.5 text-right font-normal">除息金額</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          <tr
            v-for="ev in overflowDialogEvents"
            :key="ev.id"
            class="hover:bg-surface-3 transition-colors cursor-pointer"
            @click="overflowDialogDate = null; router.push(`/stock/${ev.stockCode}`)"
          >
            <td class="py-1.5 text-content-soft">{{ ev.stockCode }}</td>
            <td class="py-1.5 text-content truncate max-w-[160px]">{{ ev.stockName }}</td>
            <td class="py-1.5 text-content-faint">{{ FREQ_OPTIONS.find(f => f.value === ev.freq)?.label ?? ev.freq }}</td>
            <td class="py-1.5 text-right font-semibold" :class="ev.amount > 0 ? 'text-accent' : 'text-content-faint'">
              {{ ev.amount > 0 ? `${ev.amount.toFixed(2)} 元` : '尚未公布' }}
            </td>
          </tr>
        </tbody>
      </table>
    </Dialog>

    <!-- 事件詳情浮層 -->
    <Transition name="fade">
      <div
        v-if="selectedEvent"
        class="fixed inset-0 z-50 flex items-center justify-center"
        @click.self="selectedEvent = null"
      >
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <div class="relative w-[360px] overflow-hidden shadow-2xl" style="background:#101013; border:1px solid rgba(255,255,255,0.14); border-radius:20px">
          <!-- 頂部色條 -->
          <div class="h-[3px] w-full" style="background: linear-gradient(90deg, var(--accent,#22c55e) 0%, rgba(34,197,94,0.2) 100%)" />

          <!-- 股票標題 -->
          <div class="px-5 pt-4 pb-3 flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="font-mono text-[10px] text-content-faint tracking-widest uppercase mb-0.5">{{ selectedEvent.stockCode }}</div>
              <div class="text-[15px] font-semibold text-content leading-tight truncate">{{ selectedEvent.stockName }}</div>
            </div>
            <span class="shrink-0 font-mono text-[10px] font-medium px-2 py-0.5 rounded-[5px]" style="color:var(--accent,#22c55e); background:rgba(34,197,94,0.12)">
              {{ FREQ_OPTIONS.find(f => f.value === selectedEvent.freq)?.label ?? selectedEvent.freq }}
            </span>
          </div>

          <!-- 分隔 -->
          <div class="mx-5" style="height:1px; background:rgba(255,255,255,0.06)" />

          <!-- 數據列 -->
          <div class="px-5 py-4 flex items-center justify-between gap-4">
            <div>
              <div class="font-mono text-[9px] text-content-faint uppercase tracking-widest mb-1">配息金額</div>
              <div class="font-mono text-[22px] font-semibold leading-none" style="color:var(--accent,#22c55e)">
                {{ selectedEvent.amount > 0 ? selectedEvent.amount.toFixed(2) : '—' }}
              </div>
              <div v-if="selectedEvent.amount > 0" class="font-mono text-[10px] text-content-faint mt-0.5">元 / 股</div>
              <div v-else class="font-mono text-[10px] text-content-faint mt-0.5">尚未公布</div>
            </div>
            <div class="text-right">
              <div class="font-mono text-[9px] text-content-faint uppercase tracking-widest mb-1">除息日</div>
              <div class="font-mono text-[15px] font-semibold text-content">{{ fmtDate(selectedEvent.exDate) }}</div>
            </div>
          </div>

          <!-- 操作按鈕 -->
          <div class="px-4 pb-4 flex gap-2">
            <button
              class="flex-1 py-2 text-[11px] font-mono rounded-[10px] transition-colors"
              style="background:rgba(255,255,255,0.06); color:rgba(255,255,255,0.5)"
              @click="selectedEvent = null"
            >關閉</button>
            <RouterLink
              :to="`/stock/${selectedEvent.stockCode}`"
              class="flex-1 py-2 text-[11px] font-mono rounded-[10px] text-center transition-colors"
              style="background:rgba(34,197,94,0.15); color:var(--accent,#22c55e)"
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
import { RouterLink, useRouter } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import ToggleSwitch from 'primevue/toggleswitch'
import Chip from 'primevue/chip'
import Dialog from 'primevue/dialog'
import { calendarApi } from '@/services/api/calendar'
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

const router = useRouter()
const today = new Date()
const year = ref<number>(today.getFullYear())
const month = ref<number>(today.getMonth() + 1)
const events = ref<CalendarEvent[]>([])
const loading = ref<boolean>(false)
const selectedEvent = ref<CalendarEvent | null>(null)
const overflowDialogDate = ref<string | null>(null)

/** Dialog visible binding（PrimeVue Dialog 需要 boolean） */
const overflowDialogVisible = computed<boolean>({
  get: () => overflowDialogDate.value !== null,
  set: (v: boolean) => { if (!v) overflowDialogDate.value = null },
})

/** Dialog 標題：YYYY/MM/DD */
const overflowDialogTitle = computed<string>(() =>
  overflowDialogDate.value ? overflowDialogDate.value.replace(/-/g, '/') : '',
)

const filters = ref<{
  watchlistOnly: boolean
  freq: string
  yieldGt: number
}>({
  watchlistOnly: false,
  freq: '',
  yieldGt: 0,
})

/** 殖利率 slider 即時顯示值；滑鼠放開後才寫入 filters.yieldGt 觸發請求 */
const pendingYieldGt = ref<number>(0)

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
 * 格式化配息金額為晶片標籤；零值（待公告）顯示「尚未公布」。
 * @param ev 行事曆事件
 * @returns 金額字串（如 $1.2）或「尚未公布」
 */
const amountLabel = (ev: CalendarEvent): string =>
  ev.amount > 0 ? `$${ev.amount.toFixed(2)}` : '尚未公布'

/**
 * 格式化日期字串為 MM/DD，直接切割字串避免 Date 建構的 UTC 時差問題。
 * @param d ISO 日期字串（YYYY-MM-DD 或 YYYY-MM-DDTHH:mm:ss.sssZ）或 null
 * @returns MM/DD 格式字串
 */
const fmtDate = (d: string | null | undefined): string => {
  if (!d) return '—'
  const [, m, day] = d.slice(0, 10).split('-')
  return `${Number(m)}/${Number(day)}`
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

/** Dialog 表格事件清單 */
const overflowDialogEvents = computed<CalendarEvent[]>(() =>
  overflowDialogDate.value
    ? (calendarCells.value.find((c) => c.key === overflowDialogDate.value)?.events ?? [])
    : [],
)

/**
 * 本地日期轉 YYYY-MM-DD 字串，避免 toISOString() 的 UTC 時差問題。
 * @param d 本地日期
 * @returns YYYY-MM-DD 格式字串
 */
const toLocalDateKey = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

/**
 * 建立單一格子資料
 * @param date 日期
 * @param currentMonth 是否屬於當月
 */
const makeCell = (date: Date, currentMonth: boolean) => {
  const key = toLocalDateKey(date)
  const isToday =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()

  const dayEvents = events.value.filter((ev) => {
    const exDate = ev.exDate?.slice(0, 10) ?? null
    const payDate = ev.payDate?.slice(0, 10) ?? null
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

/** 載入行事曆資料（同時載入下個月，供格子後補位顯示） */
const loadEvents = async (): Promise<void> => {
  loading.value = true
  try {
    const filterParams = {
      watchlistOnly: filters.value.watchlistOnly || undefined,
      freq: filters.value.freq || undefined,
      yieldGt: filters.value.yieldGt > 0 ? filters.value.yieldGt : undefined,
    }
    const nextYear = month.value === 12 ? year.value + 1 : year.value
    const nextMonth = month.value === 12 ? 1 : month.value + 1

    const [mainRes, nextRes] = await Promise.all([
      calendarApi.getMonthEvents(year.value, month.value, filterParams),
      calendarApi.getMonthEvents(nextYear, nextMonth, filterParams),
    ])
    events.value = [...mainRes.data, ...nextRes.data]
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
