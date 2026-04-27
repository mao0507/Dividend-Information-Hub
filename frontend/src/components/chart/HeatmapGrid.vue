<template>
  <div class="space-y-2">
    <div class="grid grid-cols-[110px_repeat(12,minmax(0,1fr))] gap-1">
      <div class="font-mono text-[10px] text-content-faint px-2 py-1">Sector</div>
      <div v-for="(m, idx) in months" :key="`m-${idx}`" class="font-mono text-[10px] text-content-faint text-center py-1">
        {{ m }}
      </div>
    </div>

    <div
      v-for="(row, rowIdx) in rows"
      :key="`${row.label}-${rowIdx}`"
      class="grid grid-cols-[110px_repeat(12,minmax(0,1fr))] gap-1"
    >
      <div class="font-mono text-[11px] text-content-soft px-2 py-1 truncate">{{ row.label }}</div>
      <div
        v-for="(v, colIdx) in row.values"
        :key="`${row.label}-${colIdx}`"
        class="h-6 rounded-[4px] border border-border"
        :style="cellStyle(v)"
        :title="`${row.label} / ${months[colIdx]}: ${Math.round(v).toLocaleString()}`"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type HeatmapRow = {
  label: string
  values: number[]
}

const props = withDefaults(defineProps<{
  rows: HeatmapRow[]
  months?: string[]
}>(), {
  months: () => ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
})

const maxValue = computed<number>(() => {
  const all = props.rows.flatMap((row) => row.values)
  return Math.max(1, ...all)
})

/**
 * 依數值產生格子顏色（同色不同透明度）。
 * @param value 數值
 * @returns CSS style
 */
const cellStyle = (value: number): Record<string, string> => {
  const ratio = Math.min(1, Math.max(0, value / maxValue.value))
  const alpha = 0.12 + ratio * 0.72
  return {
    background: `rgba(34,197,94,${alpha.toFixed(3)})`,
  }
}
</script>
