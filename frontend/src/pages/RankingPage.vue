<template>
  <AppLayout :breadcrumbs="['高股息排行']">
    <div class="flex h-full overflow-hidden">
      <!-- 預設篩選 -->
      <aside class="hidden lg:flex w-[200px] shrink-0 border-r border-border flex-col p-4 gap-2 overflow-y-auto">
        <div class="text-[10px] font-mono text-content-faint uppercase tracking-widest">預設組合</div>
        <button
          v-for="p in presets"
          :key="p.id"
          type="button"
          class="text-left px-3 py-2 rounded-[var(--radius)] text-[12px] font-mono border border-border bg-surface-2 hover:bg-surface-3 text-content-soft transition-colors"
          @click="applyPreset(p)"
        >
          {{ p.name }}
        </button>
      </aside>

      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <!-- 篩選列 -->
        <div class="shrink-0 border-b border-border px-4 py-3 space-y-3">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-[10px] font-mono text-content-faint uppercase tracking-widest w-full sm:w-auto">篩選</span>
            <div class="flex gap-1 overflow-x-auto pb-1 sm:pb-0 flex-1 min-w-0">
              <button
                v-for="y in YIELD_PILLS"
                :key="y"
                type="button"
                :class="pillClass(filters.yieldGt === y)"
                @click="setYieldGt(y)"
              >
                殖利率 ≥{{ y }}%
              </button>
              <button
                type="button"
                :class="pillClass(!!filters.freq)"
                @click="toggleFreqMenu"
              >
                <span class="inline-flex items-center gap-1">
                  頻率 {{ filters.freq ? `·${freqLabel(filters.freq)}` : '' }}
                  <ThemedIcon name="chevron-down" size-class="w-3 h-3" />
                </span>
              </button>
            </div>
            <span class="font-mono text-[11px] text-content-faint whitespace-nowrap">
              共 {{ total }} 檔
            </span>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-6 gap-2">
            <USelect v-model="sectorStr" :options="SECTOR_OPTIONS" />
            <USelect v-model="streakStr" :options="STREAK_OPTIONS" />
            <USelect v-model="fillStr" :options="FILL_OPTIONS" />
            <USelect v-model="capStr" :options="CAP_OPTIONS" />
          </div>
        </div>

        <!-- 表格 / 行動卡片 -->
        <div class="flex-1 overflow-auto p-4">
          <div v-if="viewState === 'loading'" class="py-16 text-center text-content-faint font-mono text-sm">載入中…</div>
          <div
            v-else-if="viewState === 'error'"
            class="bg-surface-2 border border-border rounded-[var(--radius)] p-8 text-center space-y-3"
          >
            <div class="font-mono text-sm text-danger">排行榜載入失敗</div>
            <div class="text-[12px] text-content-soft">{{ errorMessage || '請稍後再試，或調整篩選後重試。' }}</div>
            <UButton size="sm" @click="retryLoad">重新載入</UButton>
          </div>
          <div
            v-else-if="viewState === 'empty'"
            class="bg-surface-2 border border-border rounded-[var(--radius)] p-8 text-center space-y-2"
          >
            <div class="font-mono text-sm text-content">目前沒有符合條件的項目</div>
            <div class="text-[12px] text-content-soft">可放寬篩選條件，或切換預設組合後再試一次。</div>
          </div>

          <template v-else>
            <!-- 桌機表 -->
            <div class="hidden md:block bg-surface-2 border border-border rounded-[var(--radius)] overflow-x-auto">
              <table class="w-full text-left text-[12px]">
                <thead class="bg-surface-3 font-mono text-[10px] text-content-faint uppercase tracking-wider">
                  <tr>
                    <th class="px-3 py-2 w-10">#</th>
                    <th class="px-3 py-2">代號</th>
                    <th class="px-3 py-2">名稱</th>
                    <th class="px-3 py-2">頻率</th>
                    <th class="px-3 py-2 text-right">殖利率</th>
                    <th class="px-3 py-2 text-right">年配</th>
                    <th class="px-3 py-2 text-right">股價</th>
                    <th class="px-3 py-2 text-right">漲跌</th>
                    <th class="px-3 py-2 min-w-[100px]">填息</th>
                    <th class="px-3 py-2 w-16">動作</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-border">
                  <tr
                    v-for="row in rows"
                    :key="`${row.code}-${row.rank}`"
                    class="hover:bg-surface-3/60 cursor-pointer transition-colors"
                    @click="goStock(row.code)"
                  >
                    <td class="px-3 py-2 font-mono text-content-faint">{{ row.rank }}</td>
                    <td class="px-3 py-2 font-mono text-accent">{{ row.code }}</td>
                    <td class="px-3 py-2">
                      <div class="font-medium text-content">{{ row.name }}</div>
                      <div class="flex flex-wrap gap-1 mt-0.5">
                        <UChip color="#94a3b8" bg="rgba(148,163,184,0.12)">{{ row.sector }}</UChip>
                        <UChip v-if="row.badge" color="#22c55e" bg="rgba(34,197,94,0.12)">{{ row.badge }}</UChip>
                      </div>
                    </td>
                    <td class="px-3 py-2 font-mono text-content-soft">{{ fmtFreq(row.freq) }}</td>
                    <td class="px-3 py-2 text-right font-mono text-accent font-semibold">{{ fmtNumber(row.yield) }}%</td>
                    <td class="px-3 py-2 text-right font-mono">{{ fmtNumber(row.cash) }}</td>
                    <td class="px-3 py-2 text-right font-mono">{{ fmtNumber(row.price) }}</td>
                    <td :class="['px-3 py-2 text-right font-mono', row.changePct >= 0 ? 'text-up' : 'text-down']">
                      {{ row.changePct >= 0 ? '+' : '' }}{{ fmtNumber(row.changePct) }}%
                    </td>
                    <td class="px-3 py-2">
                      <div class="h-1.5 bg-surface-3 rounded-full overflow-hidden">
                        <div
                          class="h-full rounded-full bg-accent transition-all"
                          :style="{ width: `${Math.min(100, row.fillRate)}%` }"
                        />
                      </div>
                      <div class="text-[10px] font-mono text-content-faint mt-0.5">{{ fmtInt(row.fillRate) }}%</div>
                    </td>
                    <td class="px-3 py-2" @click.stop>
                      <div class="flex gap-1">
                        <UButton class="!px-2 !py-1 text-[10px]" @click="goStock(row.code)">詳</UButton>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- 行動卡片 -->
            <div class="md:hidden space-y-2">
              <div
                v-for="row in rows"
                :key="`m-${row.code}`"
                class="bg-surface-2 border border-border rounded-[var(--radius)] p-3 flex flex-col gap-2"
                @click="goStock(row.code)"
              >
                <div class="flex items-baseline justify-between">
                  <span class="font-mono text-accent font-semibold">{{ row.rank }}. {{ row.code }}</span>
                  <span :class="['font-mono text-sm', row.changePct >= 0 ? 'text-up' : 'text-down']">
                    {{ row.changePct >= 0 ? '+' : '' }}{{ fmtNumber(row.changePct) }}%
                  </span>
                </div>
                <div class="text-sm text-content font-medium truncate">{{ row.name }}</div>
                <div class="flex justify-between font-mono text-[12px]">
                  <span class="text-content-faint">殖利率</span>
                  <span class="text-accent font-semibold">{{ fmtNumber(row.yield) }}%</span>
                </div>
              </div>
            </div>
          </template>
        </div>

        <div class="shrink-0 border-t border-border px-4 py-2 flex items-center gap-3">
          <UButton @click="exportCsv">匯出 CSV</UButton>
          <div class="flex-1"></div>
          <button
            type="button"
            class="px-2 py-1 font-mono text-[11px] text-content-faint hover:text-content disabled:opacity-40"
            :disabled="page <= 1"
            @click="page--"
          >
            上一頁
          </button>
          <span class="font-mono text-[11px] text-content-soft">{{ page }} / {{ totalPages }}</span>
          <button
            type="button"
            class="px-2 py-1 font-mono text-[11px] text-content-faint hover:text-content disabled:opacity-40"
            :disabled="page >= totalPages"
            @click="page++"
          >
            下一頁
          </button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import UChip from '@/components/ui/UChip.vue'
import UButton from '@/components/ui/UButton.vue'
import USelect from '@/components/ui/USelect.vue'
import ThemedIcon from '@/components/icons/ThemedIcon.vue'
import { stockApi } from '@/api/stock'
import type { RankingStock, RankingPreset } from '@/types'

const router = useRouter()

const YIELD_PILLS = [3, 5, 7] as const

const SECTOR_OPTIONS = [
  { value: '', label: '全部產業' },
  { value: '半導體', label: '半導體' },
  { value: '金融', label: '金融' },
  { value: '電子', label: '電子' },
  { value: 'ETF', label: 'ETF' },
  { value: '電信', label: '電信' },
  { value: '塑化', label: '塑化' },
  { value: '食品', label: '食品' },
]

const STREAK_OPTIONS = [
  { value: '', label: '連續配息' },
  { value: '5', label: '≥ 5 年' },
  { value: '10', label: '≥ 10 年' },
  { value: '15', label: '≥ 15 年' },
]

const FILL_OPTIONS = [
  { value: '', label: '填息天數' },
  { value: '20', label: '≤ 20 日' },
  { value: '15', label: '≤ 15 日' },
  { value: '10', label: '≤ 10 日' },
]

const CAP_OPTIONS = [
  { value: '', label: '市值' },
  { value: '100000000000', label: '≥ 1000 億' },
  { value: '3000000000000', label: '≥ 3000 億' },
]

const rows = ref<RankingStock[]>([])
const total = ref<number>(0)
type ViewState = 'loading' | 'ready' | 'empty' | 'error'

const loading = ref<boolean>(true)
const viewState = ref<ViewState>('loading')
const errorMessage = ref<string>('')
const latestRequestId = ref<number>(0)
const page = ref<number>(1)
const limit = ref<number>(30)

const filters = ref<{
  yieldGt?: number
  freq?: string
  sector?: string
  streakGte?: number
  fillDaysLte?: number
  marketCapGte?: number
}>({})

const sectorStr = ref<string>('')
const streakStr = ref<string>('')
const fillStr = ref<string>('')
const capStr = ref<string>('')

const presets = ref<RankingPreset[]>([])

const totalPages = computed<number>(() => Math.max(1, Math.ceil(total.value / limit.value)))

/** API 查詢參數（含下拉欄位） */
const rankingQuery = computed(() => ({
  yieldGt: filters.value.yieldGt,
  freq: filters.value.freq,
  sector: sectorStr.value || undefined,
  streakGte: streakStr.value ? parseInt(streakStr.value, 10) : undefined,
  fillDaysLte: fillStr.value ? parseInt(fillStr.value, 10) : undefined,
  marketCapGte: capStr.value ? parseFloat(capStr.value) : undefined,
  page: page.value,
  limit: limit.value,
}))

/**
 * 載入排行榜與預設組合
 */
const loadRanking = async (): Promise<void> => {
  const requestId = latestRequestId.value + 1
  latestRequestId.value = requestId
  loading.value = true
  viewState.value = 'loading'
  errorMessage.value = ''
  try {
    const res = await stockApi.getRanking(rankingQuery.value)
    if (requestId !== latestRequestId.value) {
      return
    }
    rows.value = (res.data.data ?? []).map((row, idx) => normalizeRankingRow(row, idx))
    total.value = res.data.total ?? rows.value.length
    viewState.value = rows.value.length > 0 ? 'ready' : 'empty'
  } catch (error: unknown) {
    if (requestId !== latestRequestId.value) {
      return
    }
    rows.value = []
    total.value = 0
    viewState.value = 'error'
    errorMessage.value = error instanceof Error ? error.message : '資料暫時無法取得'
  } finally {
    loading.value = false
  }
}

/**
 * 將後端回傳的排行榜資料正規化，避免缺值導致渲染錯誤（黑屏）。
 * @param row 原始資料
 * @param idx 項目索引
 * @returns 正規化後的 RankingStock
 */
const normalizeRankingRow = (row: Partial<RankingStock>, idx: number): RankingStock => ({
  rank: Number.isFinite(row.rank) ? row.rank : idx + 1,
  code: row.code ?? '----',
  name: row.name ?? '未知名稱',
  sector: row.sector ?? '未知產業',
  freq: row.freq ?? 'annual',
  yield: Number.isFinite(row.yield) ? row.yield : 0,
  cash: Number.isFinite(row.cash) ? row.cash : 0,
  price: Number.isFinite(row.price) ? row.price : 0,
  changePct: Number.isFinite(row.changePct) ? row.changePct : 0,
  fillRate: Number.isFinite(row.fillRate) ? row.fillRate : 0,
  badge: row.badge,
  isEtf: Boolean(row.isEtf),
})

/**
 * 格式化浮點顯示。
 * @param value 數值
 * @returns 兩位小數字串
 */
const fmtNumber = (value: number): string => (Number.isFinite(value) ? value : 0).toFixed(2)

/**
 * 格式化整數顯示。
 * @param value 數值
 * @returns 四捨五入整數字串
 */
const fmtInt = (value: number): string => String(Math.round(Number.isFinite(value) ? value : 0))

/**
 * 重新載入排行榜資料。
 * @returns Promise<void>
 */
const retryLoad = async (): Promise<void> => {
  await loadRanking()
}

watch(
  rankingQuery,
  () => {
    void loadRanking()
  },
  { deep: true, immediate: true },
)

watch([sectorStr, streakStr, fillStr, capStr], () => {
  page.value = 1
})

/**
 * 套用預設篩選組合
 * @param p 預設項目
 */
const applyPreset = (p: RankingPreset): void => {
  filters.value = {
    yieldGt: p.filters.yieldGt,
    freq: p.filters.freq,
  }
  sectorStr.value = p.filters.sector ?? ''
  streakStr.value = p.filters.streakGte !== undefined ? String(p.filters.streakGte) : ''
  fillStr.value = p.filters.fillDaysLte !== undefined ? String(p.filters.fillDaysLte) : ''
  capStr.value = p.filters.marketCapGte !== undefined ? String(p.filters.marketCapGte) : ''
  page.value = 1
}

/**
 * 切換殖利率門檻 pill
 * @param y 門檻百分比
 */
const setYieldGt = (y: number): void => {
  filters.value.yieldGt = filters.value.yieldGt === y ? undefined : y
  page.value = 1
}

const pillClass = (on: boolean): string =>
  [
    'shrink-0 px-2.5 py-1 rounded-full text-[11px] font-mono border transition-colors',
    on ? 'border-accent bg-accent/15 text-accent' : 'border-border text-content-soft hover:bg-surface-3',
  ].join(' ')

const FREQ_CHOICES = [
  { value: 'monthly', label: '月配' },
  { value: 'quarterly', label: '季配' },
  { value: 'semi-annual', label: '半年配' },
  { value: 'annual', label: '年配' },
]

const toggleFreqMenu = (): void => {
  const order: (string | undefined)[] = [undefined, ...FREQ_CHOICES.map((c) => c.value)]
  const cur = filters.value.freq
  const i = order.indexOf(cur)
  filters.value.freq = order[(i + 1) % order.length]
  page.value = 1
}

const freqLabel = (f: string): string => FREQ_CHOICES.find((x) => x.value === f)?.label ?? f

const fmtFreq = (f: string): string => freqLabel(f) || f

/**
 * 匯出目前結果為 CSV（UTF-8 BOM）
 */
const exportCsv = (): void => {
  const header = ['rank', 'code', 'name', 'sector', 'freq', 'yield', 'cash', 'price', 'changePct', 'fillRate']
  const lines = [
    header.join(','),
    ...rows.value.map((r) =>
      [
        r.rank,
        r.code,
        `"${r.name.replace(/"/g, '""')}"`,
        r.sector,
        r.freq,
        r.yield,
        r.cash,
        r.price,
        r.changePct,
        r.fillRate,
      ].join(','),
    ),
  ]
  const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ranking-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

const goStock = (code: string): void => {
  void router.push(`/stock/${code}`)
}

onMounted(async () => {
  try {
    const pr = await stockApi.getRankingPresets()
    presets.value = pr.data
  } catch {
    presets.value = []
  }
})
</script>
