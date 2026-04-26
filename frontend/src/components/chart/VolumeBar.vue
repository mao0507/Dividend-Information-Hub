<template>
  <svg
    :width="width"
    :height="height"
    :viewBox="`0 0 ${width} ${height}`"
    style="display:block"
    preserveAspectRatio="none"
  >
    <rect
      v-for="(v, i) in series"
      :key="i"
      :x="(i / series.length) * width + 0.5"
      :width="barW - 1"
      :y="height - (v / maxV) * height"
      :height="(v / maxV) * height"
      :fill="(props.colors ?? [])[i] ?? 'rgba(255,255,255,0.15)'"
      rx="1"
    />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  series?: number[]
  colors?: string[]
  width?: number
  height?: number
}>(), {
  width: 800,
  height: 48,
})

const series = computed(() => {
  if (props.series?.length) return props.series
  return Array.from({ length: 60 }, (_, i) => 5000 + Math.abs(Math.sin(i * 0.7) * 3000 + Math.cos(i * 1.3) * 2000))
})

const maxV = computed(() => Math.max(...series.value) || 1)
const barW = computed(() => props.width / series.value.length)
</script>
