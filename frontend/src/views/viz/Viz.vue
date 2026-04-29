<template>
  <AppLayout :breadcrumbs="['收益視覺化']">
    <div class="p-6 max-w-[1400px] mx-auto space-y-6">
      <div class="flex items-center gap-2">
        <span class="font-mono text-xs uppercase tracking-widest text-content-faint">年份</span>
        <div class="inline-flex gap-1 bg-surface-3 rounded p-1">
          <button
            v-for="year in yearOptions"
            :key="year"
            type="button"
            :class="['px-2.5 py-1 text-[10px] font-mono rounded transition-colors', selectedYear === year ? 'bg-accent/20 text-accent' : 'text-content-soft hover:text-content']"
            @click="selectedYear = year"
          >{{ year }}</button>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section class="bg-surface-2 border border-border rounded-[var(--radius)] p-5">
          <div class="font-mono text-xs uppercase tracking-widest text-content-faint mb-4">產業分布</div>
          <DonutChart :segments="donutSegments" />
        </section>
        <section class="bg-surface-2 border border-border rounded-[var(--radius)] p-5">
          <div class="font-mono text-xs uppercase tracking-widest text-content-faint mb-4">月度股息收入</div>
          <BarChart :items="monthlyBars" />
        </section>
      </div>

      <section class="bg-surface-2 border border-border rounded-[var(--radius)] p-5">
        <div class="font-mono text-xs uppercase tracking-widest text-content-faint mb-4">產業 × 月份熱力圖</div>
        <HeatmapGrid :rows="heatmapRows" :months="monthLabels" />
      </section>

      <section class="bg-surface-2 border border-border rounded-[var(--radius)] p-5">
        <div class="font-mono text-xs uppercase tracking-widest text-content-faint mb-4">年度累計分層成長（近 6 年）</div>
        <StackedBar :rows="growthRows" />
      </section>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import DonutChart from '@/components/chart/DonutChart.vue'
import BarChart from '@/components/chart/BarChart.vue'
import HeatmapGrid from '@/components/chart/HeatmapGrid.vue'
import StackedBar from '@/components/chart/StackedBar.vue'
import { vizApi } from '@/services/api/viz'
import type { VizAnnualGrowth, VizHeatmap, VizMonthlyIncome, VizSectorDistribution } from '@/types'

const thisYear = new Date().getFullYear()
const yearOptions = [thisYear - 2, thisYear - 1, thisYear]
const monthLabels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']

const selectedYear = ref<number>(thisYear)
const sectorDistribution = ref<VizSectorDistribution | null>(null)
const monthlyIncome = ref<VizMonthlyIncome | null>(null)
const heatmap = ref<VizHeatmap | null>(null)
const annualGrowth = ref<VizAnnualGrowth | null>(null)

const donutSegments = computed<Array<{ label: string; pct: number; value: number }>>(() =>
  (sectorDistribution.value?.sectors ?? []).map((item) => ({
    label: item.sector,
    pct: item.pct,
    value: item.value,
  })),
)

const monthlyBars = computed<Array<{ label: string; value: number }>>(() =>
  (monthlyIncome.value?.months ?? []).map((m) => ({ label: `${m.month}`, value: m.income })),
)

const heatmapRows = computed<Array<{ label: string; values: number[] }>>(() =>
  (heatmap.value?.sectors ?? []).map((row) => ({
    label: row.sector,
    values: row.values,
  })),
)

const growthRows = computed<Array<{ year: number; sectors: Record<string, number> }>>(() =>
  (annualGrowth.value?.years ?? []).map((row) => ({
    year: row.year,
    sectors: row.sectors,
  })),
)

/**
 * 依目前年份重抓視覺化資料。
 * @returns Promise<void>
 */
const fetchVizData = async (): Promise<void> => {
  try {
    const [sectorRes, monthlyRes, heatmapRes, growthRes] = await Promise.all([
      vizApi.getSectorDistribution(),
      vizApi.getMonthlyIncome(selectedYear.value),
      vizApi.getHeatmap(selectedYear.value),
      vizApi.getAnnualGrowth(6),
    ])
    sectorDistribution.value = sectorRes.data
    monthlyIncome.value = monthlyRes.data
    heatmap.value = heatmapRes.data
    annualGrowth.value = growthRes.data
  } catch {
    sectorDistribution.value = { totalValue: 0, sectors: [] }
    monthlyIncome.value = { year: selectedYear.value, months: Array.from({ length: 12 }, (_, i) => ({ month: i + 1, income: 0 })), annualIncome: 0 }
    heatmap.value = { year: selectedYear.value, sectors: [] }
    annualGrowth.value = { years: [] }
  }
}

watch(selectedYear, () => {
  void fetchVizData()
})

onMounted(async () => {
  await fetchVizData()
})
</script>
