<template>
  <svg :viewBox="`0 0 ${width} ${height}`" class="w-full h-[260px]">
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
    <rect
      v-for="(it, idx) in items"
      :key="`${it.label}-${idx}`"
      :x="toX(idx)"
      :y="toY(it.value)"
      :width="barWidth"
      :height="Math.max(0, toY(0) - toY(it.value))"
      :fill="idx === peakIndex ? '#f59e0b' : '#22c55e'"
      rx="4"
    />
    <text
      v-for="(it, idx) in items"
      :key="`x-${it.label}-${idx}`"
      :x="toX(idx) + barWidth / 2"
      :y="height - 8"
      text-anchor="middle"
      fill="rgba(255,255,255,0.45)"
      font-size="10"
      font-family="'JetBrains Mono', monospace"
    >{{ it.label }}</text>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type BarItem = {
  label: string
  value: number
}

const props = withDefaults(defineProps<{
  items: BarItem[]
}>(), {})

const width = 720
const height = 260
const pad = { left: 16, right: 12, top: 14, bottom: 34 }

const maxValue = computed<number>(() => Math.max(1, ...props.items.map((item) => item.value)))
const ticks = computed<number[]>(() => Array.from({ length: 5 }, (_, i) => (maxValue.value * i) / 4))
const step = computed<number>(() => (width - pad.left - pad.right) / Math.max(1, props.items.length))
const barWidth = computed<number>(() => Math.max(10, step.value * 0.62))
const peakIndex = computed<number>(() => {
  let idx = 0
  props.items.forEach((item, i) => {
    if (item.value > props.items[idx].value) idx = i
  })
  return idx
})

/**
 * 將值轉為 Y 座標。
 * @param value 欄位數值
 * @returns 對應 Y
 */
const toY = (value: number): number => {
  const span = height - pad.top - pad.bottom
  return pad.top + (1 - value / maxValue.value) * span
}

/**
 * 依序號計算每根柱子的 X 座標。
 * @param index 柱索引
 * @returns 左上角 X
 */
const toX = (index: number): number => pad.left + index * step.value + (step.value - barWidth.value) / 2
</script>
