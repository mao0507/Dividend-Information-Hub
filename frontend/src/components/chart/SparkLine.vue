<template>
  <svg
    :width="width"
    :height="height"
    :viewBox="`0 0 120 ${height}`"
    preserveAspectRatio="none"
    style="display:block"
  >
    <path
      :d="path"
      fill="none"
      :stroke="color"
      stroke-width="1.4"
      vector-effect="non-scaling-stroke"
      stroke-linejoin="round"
      stroke-linecap="round"
    />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  series?: number[]
  width?: number | string
  height?: number
  up?: boolean
}>(), {
  height: 36,
  up: true,
})

const color = computed(() => props.up ? '#ef4444' : '#22c55e')

const series = computed(() => {
  if (props.series?.length) return props.series
  return Array.from({ length: 30 }, (_, i) => 100 + Math.sin(i * 0.8) * 5 + i * 0.1)
})

const path = computed(() => {
  const s = series.value
  const min = Math.min(...s)
  const max = Math.max(...s)
  const range = max - min || 1
  return s
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${(i / (s.length - 1)) * 120} ${(1 - (v - min) / range) * (props.height ?? 36)}`)
    .join(' ')
})
</script>
