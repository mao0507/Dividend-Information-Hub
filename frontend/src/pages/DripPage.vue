<template>
  <AppLayout :breadcrumbs="['再投入試算']">
    <div class="p-6 max-w-[1320px] mx-auto space-y-6">
      <div class="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6">
        <section class="bg-surface-2 border border-border rounded-[var(--radius)] p-5 space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="font-mono text-xs uppercase tracking-widest text-content-faint">輸入參數</h2>
            <span class="font-mono text-[10px] text-content-faint">即時試算</span>
          </div>

          <USlider v-model="form.principal" label="初始投入" :min="0" :max="10000000" :step="10000" unit=" 元" :format="fmtMoney" />
          <USlider v-model="form.monthlyAdd" label="每月加碼" :min="0" :max="200000" :step="1000" unit=" 元" :format="fmtMoney" />
          <USlider v-model="form.yield" label="殖利率" :min="0" :max="12" :step="0.1" unit="%" :format="fmtPct" />
          <USlider v-model="form.growth" label="成長率" :min="-5" :max="12" :step="0.1" unit="%" :format="fmtPct" />
          <USlider v-model="form.years" label="期間" :min="1" :max="30" :step="1" unit=" 年" :format="fmtIntYear" />
          <USlider v-model="form.taxRate" label="稅率" :min="0" :max="40" :step="0.1" unit="%" :format="fmtPct" />
        </section>

        <section class="space-y-4">
          <div class="bg-surface-2 border border-border rounded-[var(--radius)] p-5">
            <div class="flex flex-wrap gap-2 items-center">
              <span class="font-mono text-xs uppercase tracking-widest text-content-faint">目標區</span>
              <UChip color="accent" bg="rgba(34,197,94,0.12)">年領目標 {{ fmtCurrency(targetAnnualIncome) }}</UChip>
              <UChip color="#3b82f6" bg="rgba(59,130,246,0.14)">月均 {{ fmtCurrency(result?.averageMonthlyIncome ?? 0) }}</UChip>
              <UChip :color="(result?.targetAchievementYear ?? 999) <= displayYears ? '#22c55e' : '#f59e0b'" :bg="(result?.targetAchievementYear ?? 999) <= displayYears ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)'">
                {{ targetText }}
              </UChip>
              <div class="flex-1" />
              <div class="inline-flex gap-1 bg-surface-3 rounded p-1">
                <button
                  v-for="y in yearRanges"
                  :key="y"
                  type="button"
                  :class="['px-2 py-1 text-[10px] font-mono rounded transition-colors', displayYears === y ? 'bg-accent/20 text-accent' : 'text-content-soft hover:text-content']"
                  @click="displayYears = y"
                >{{ y }}Y</button>
              </div>
            </div>
          </div>

          <div class="bg-surface-2 border border-border rounded-[var(--radius)] p-5">
            <div class="font-mono text-xs uppercase tracking-widest text-content-faint mb-2">資產曲線（含再投入 vs 領出）</div>
            <svg :viewBox="`0 0 ${chartW} ${chartH}`" class="w-full h-[340px] bg-surface rounded border border-border">
              <g>
                <line
                  v-for="tick in yAxisTicks"
                  :key="`y-${tick}`"
                  :x1="padding.left"
                  :x2="chartW - padding.right"
                  :y1="toY(tick)"
                  :y2="toY(tick)"
                  stroke="rgba(255,255,255,0.06)"
                  stroke-dasharray="3 3"
                />
                <text
                  v-for="tick in yAxisTicks"
                  :key="`yl-${tick}`"
                  :x="chartW - padding.right + 8"
                  :y="toY(tick) + 3"
                  fill="rgba(255,255,255,0.45)"
                  font-size="10"
                  font-family="'JetBrains Mono', monospace"
                >{{ shortMoney(tick) }}</text>
              </g>

              <path :d="areaPathReinvest" fill="rgba(34,197,94,0.18)" />
              <path :d="linePathReinvest" fill="none" stroke="#22c55e" stroke-width="2" />
              <path :d="linePathNoReinvest" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="1.7" stroke-dasharray="5 5" />

              <line
                v-if="targetLineY !== null"
                :x1="padding.left"
                :x2="chartW - padding.right"
                :y1="targetLineY"
                :y2="targetLineY"
                stroke="rgba(245,158,11,0.7)"
                stroke-width="1.2"
                stroke-dasharray="6 4"
              />
              <text
                v-if="targetLineY !== null"
                :x="padding.left + 6"
                :y="targetLineY - 6"
                fill="rgba(245,158,11,0.9)"
                font-size="10"
                font-family="'JetBrains Mono', monospace"
              >目標 {{ shortMoney(targetAnnualIncome / Math.max(form.yield / 100, 0.0001)) }}</text>

              <g>
                <text
                  v-for="item in xLabels"
                  :key="`x-${item.index}`"
                  :x="toX(item.index)"
                  :y="chartH - 8"
                  text-anchor="middle"
                  fill="rgba(255,255,255,0.45)"
                  font-size="10"
                  font-family="'JetBrains Mono', monospace"
                >Y{{ item.year }}</text>
              </g>
            </svg>
          </div>
        </section>
      </div>

      <section class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div class="bg-surface-2 border border-border rounded-[10px] p-4">
          <div class="text-[10px] font-mono uppercase tracking-widest text-content-faint">10年後資產</div>
          <div class="font-mono text-lg text-content mt-1">{{ fmtCurrency(summaryAt10.assetsWithReinvest) }}</div>
        </div>
        <div class="bg-surface-2 border border-border rounded-[10px] p-4">
          <div class="text-[10px] font-mono uppercase tracking-widest text-content-faint">第10年年息</div>
          <div class="font-mono text-lg text-accent mt-1">{{ fmtCurrency(summaryAt10.annualDividendWithReinvest) }}</div>
        </div>
        <div class="bg-surface-2 border border-border rounded-[10px] p-4">
          <div class="text-[10px] font-mono uppercase tracking-widest text-content-faint">第10年月均</div>
          <div class="font-mono text-lg text-content mt-1">{{ fmtCurrency(summaryAt10.annualDividendWithReinvest / 12) }}</div>
        </div>
        <div class="bg-surface-2 border border-border rounded-[10px] p-4">
          <div class="text-[10px] font-mono uppercase tracking-widest text-content-faint">通膨後實質報酬</div>
          <div class="font-mono text-lg mt-1" :class="realReturnPct >= 0 ? 'text-up' : 'text-down'">{{ realReturnPct.toFixed(2) }}%</div>
        </div>
      </section>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import USlider from '@/components/ui/USlider.vue'
import UChip from '@/components/ui/UChip.vue'
import { dripApi } from '@/api/drip'
import type { DripInput, DripResult, DripYearPoint } from '@/types'

const yearRanges = [5, 10, 20, 30] as const
const targetAnnualIncome = 240000
const inflationRate = 2
const chartW = 980
const chartH = 340
const padding = { left: 52, right: 86, top: 20, bottom: 34 }

const form = ref<DripInput>({
  principal: 300000,
  monthlyAdd: 12000,
  yield: 6,
  growth: 3,
  years: 20,
  taxRate: 28.6,
})
const result = ref<DripResult | null>(null)
const displayYears = ref<number>(10)

/**
 * 轉換數字為貨幣字串（整數）
 * @param v 數值
 * @returns NT$ 顯示字串
 */
const fmtCurrency = (v: number): string => `NT$ ${Math.round(v).toLocaleString()}`

/**
 * USlider 專用格式：金額
 * @param v 數值
 * @returns 格式化字串
 */
const fmtMoney = (v: number): string => `${Math.round(v).toLocaleString()} 元`

/**
 * USlider 專用格式：百分比
 * @param v 數值
 * @returns 百分比字串
 */
const fmtPct = (v: number): string => `${v.toFixed(1)}%`

/**
 * USlider 專用格式：整數年
 * @param v 數值
 * @returns 年字串
 */
const fmtIntYear = (v: number): string => `${Math.round(v)} 年`

/**
 * 將金額縮短顯示（K / M）
 * @param v 數值
 * @returns 縮寫字串
 */
const shortMoney = (v: number): string => {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`
  return `${Math.round(v)}`
}

const visibleSeries = computed<DripYearPoint[]>(() =>
  (result.value?.series ?? []).slice(0, displayYears.value),
)

const yMax = computed<number>(() =>
  Math.max(
    1,
    ...visibleSeries.value.map((row) => Math.max(row.assetsWithReinvest, row.assetsWithoutReinvest)),
  ),
)

const yAxisTicks = computed<number[]>(() =>
  Array.from({ length: 5 }, (_, i) => (yMax.value * i) / 4),
)

/**
 * 年度索引轉為 X 座標
 * @param idx 陣列索引
 * @returns X 座標
 */
const toX = (idx: number): number => {
  const count = Math.max(visibleSeries.value.length - 1, 1)
  const span = chartW - padding.left - padding.right
  return padding.left + (idx / count) * span
}

/**
 * 金額值轉為 Y 座標
 * @param value 金額
 * @returns Y 座標
 */
const toY = (value: number): number => {
  const span = chartH - padding.top - padding.bottom
  return padding.top + (1 - value / yMax.value) * span
}

/**
 * 產生折線 path 字串
 * @param values Y 值陣列
 * @returns SVG path
 */
const makeLinePath = (values: number[]): string =>
  values
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(v).toFixed(1)}`)
    .join(' ')

const linePathReinvest = computed<string>(() =>
  makeLinePath(visibleSeries.value.map((row) => row.assetsWithReinvest)),
)

const linePathNoReinvest = computed<string>(() =>
  makeLinePath(visibleSeries.value.map((row) => row.assetsWithoutReinvest)),
)

const areaPathReinvest = computed<string>(() => {
  const pts = visibleSeries.value.map((row) => row.assetsWithReinvest)
  if (pts.length < 2) return ''
  const last = pts.length - 1
  const floorY = toY(0).toFixed(1)
  return `${makeLinePath(pts)} L ${toX(last).toFixed(1)} ${floorY} L ${toX(0).toFixed(1)} ${floorY} Z`
})

const xLabels = computed<{ index: number; year: number }[]>(() => {
  const count = visibleSeries.value.length
  if (count <= 6) {
    return visibleSeries.value.map((row, index) => ({ index, year: row.year }))
  }
  const step = Math.max(1, Math.floor((count - 1) / 5))
  return Array.from({ length: 6 }, (_, idx) => {
    const index = Math.min(idx * step, count - 1)
    return { index, year: visibleSeries.value[index].year }
  })
})

const targetLineY = computed<number | null>(() => {
  if (!result.value) return null
  const requiredAsset = targetAnnualIncome / Math.max(form.value.yield / 100, 0.0001)
  return toY(Math.min(requiredAsset, yMax.value))
})

const targetText = computed<string>(() => {
  const y = result.value?.targetAchievementYear
  if (!y) return `預計 ${displayYears.value} 年內未達成`
  return `預計第 ${y} 年達成`
})

const summaryAt10 = computed<DripYearPoint>(() => {
  const row = result.value?.series.find((s) => s.year === 10)
  if (row) return row
  const fallback = result.value?.series[result.value.series.length - 1]
  return (
    fallback ?? {
      year: 0,
      assetsWithReinvest: 0,
      assetsWithoutReinvest: 0,
      annualDividendWithReinvest: 0,
      annualDividendWithoutReinvest: 0,
    }
  )
})

const realReturnPct = computed<number>(() => {
  const years = Math.max(summaryAt10.value.year, 1)
  const invested = form.value.principal + form.value.monthlyAdd * 12 * years
  if (invested <= 0) return 0
  const nominal = (summaryAt10.value.assetsWithReinvest - invested) / invested
  const inflationAdj = Math.pow(1 + inflationRate / 100, years) - 1
  return ((1 + nominal) / (1 + inflationAdj) - 1) * 100
})

/**
 * 呼叫後端 DRIP API 並更新圖表資料
 * @returns Promise<void>
 */
const fetchDrip = async (): Promise<void> => {
  try {
    const res = await dripApi.calculate(form.value)
    result.value = res.data
  } catch {
    result.value = null
  }
}

watch(
  form,
  () => {
    void fetchDrip()
  },
  { deep: true },
)

watch(
  () => form.value.years,
  (years: number) => {
    displayYears.value = Math.min(displayYears.value, years)
  },
)

onMounted(async () => {
  await fetchDrip()
})
</script>
