<template>
  <svg :viewBox="`0 0 ${width} ${height}`" class="w-full h-[280px]">
    <line
      v-for="tick in ticks"
      :key="`grid-${tick}`"
      :x1="pad.left"
      :x2="width - pad.right"
      :y1="toY(tick)"
      :y2="toY(tick)"
      stroke="rgba(255,255,255,0.08)"
      stroke-dasharray="3 3"
    />
    <g v-for="(row, rowIdx) in rows" :key="`${row.year}-${rowIdx}`">
      <rect
        v-for="segment in stackRects(row)"
        :key="`${row.year}-${segment.key}`"
        :x="toX(rowIdx)"
        :y="segment.y"
        :width="barWidth"
        :height="segment.h"
        :fill="segment.color"
      />
      <text
        :x="toX(rowIdx) + barWidth / 2"
        :y="height - 8"
        text-anchor="middle"
        fill="rgba(255,255,255,0.45)"
        font-size="10"
        font-family="'JetBrains Mono', monospace"
      >{{ row.year }}</text>
    </g>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type StackedRow = {
  year: number
  sectors: Record<string, number>
}

const palette = ['#22c55e', '#3b82f6', '#a855f7', '#f59e0b', '#14b8a6', '#ef4444', '#84cc16']

const props = withDefaults(defineProps<{
  rows: StackedRow[]
}>(), {})

const width = 860
const height = 280
const pad = { left: 20, right: 12, top: 14, bottom: 34 }

const sectorKeys = computed<string[]>(() => {
  const set = new Set<string>()
  props.rows.forEach((row) => {
    Object.keys(row.sectors).forEach((k) => set.add(k))
  })
  return [...set]
})

const totals = computed<number[]>(() =>
  props.rows.map((row) => Object.values(row.sectors).reduce((sum, n) => sum + n, 0)),
)

const maxTotal = computed<number>(() => Math.max(1, ...totals.value))
const ticks = computed<number[]>(() => Array.from({ length: 5 }, (_, i) => (maxTotal.value * i) / 4))
const step = computed<number>(() => (width - pad.left - pad.right) / Math.max(1, props.rows.length))
const barWidth = computed<number>(() => Math.max(12, step.value * 0.62))

/**
 * 值轉為 Y 座標。
 * @param value 金額
 * @returns Y 座標
 */
const toY = (value: number): number => {
  const span = height - pad.top - pad.bottom
  return pad.top + (1 - value / maxTotal.value) * span
}

/**
 * 欄位索引轉為 X 座標。
 * @param index 欄位索引
 * @returns X 座標
 */
const toX = (index: number): number => pad.left + index * step.value + (step.value - barWidth.value) / 2

/**
 * 計算某一年度的堆疊矩形資訊。
 * @param row 單年度資料
 * @returns 每個分層矩形
 */
const stackRects = (row: StackedRow): Array<{ key: string; y: number; h: number; color: string }> => {
  let cursor = 0
  return sectorKeys.value.map((key, idx) => {
    const value = row.sectors[key] ?? 0
    const yTop = toY(cursor + value)
    const yBottom = toY(cursor)
    const rect = {
      key,
      y: yTop,
      h: Math.max(0, yBottom - yTop),
      color: palette[idx % palette.length],
    }
    cursor += value
    return rect
  })
}
</script>
