<template>
  <svg
    v-if="series.length >= 2"
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
  <span
    v-else
    class="font-mono text-[10px] text-content-faint"
    role="img"
    aria-label="價格資料不足，無法繪製走勢"
  >—</span>
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

const color = computed(() => props.up ? 'var(--up-color)' : 'var(--down-color)')

/** 價格資料不足（&lt;2 筆）時不得繪製假趨勢線，一律回傳空陣列並由樣板顯示「資料不足」 */
const series = computed(() => props.series?.length ? props.series : [])

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
