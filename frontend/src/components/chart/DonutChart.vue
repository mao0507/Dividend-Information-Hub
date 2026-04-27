<template>
  <div class="flex gap-4 items-center">
    <svg :viewBox="`0 0 ${size} ${size}`" class="w-[220px] h-[220px]">
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        :stroke-width="stroke"
      />
      <circle
        v-for="(seg, idx) in coloredSegments"
        :key="`${seg.label}-${idx}`"
        :cx="center"
        :cy="center"
        :r="radius"
        fill="none"
        :stroke="seg.color"
        :stroke-width="stroke"
        stroke-linecap="round"
        :stroke-dasharray="`${seg.len} ${circumference - seg.len}`"
        :stroke-dashoffset="-seg.offset"
        :transform="`rotate(-90 ${center} ${center})`"
      />
      <text :x="center" :y="center - 2" text-anchor="middle" fill="rgba(255,255,255,0.92)" font-size="18" font-family="'JetBrains Mono', monospace">
        {{ totalPct.toFixed(0) }}%
      </text>
      <text :x="center" :y="center + 16" text-anchor="middle" fill="rgba(255,255,255,0.45)" font-size="10" font-family="'JetBrains Mono', monospace">
        Allocation
      </text>
    </svg>

    <div class="space-y-2 min-w-[180px]">
      <div v-for="(seg, idx) in coloredSegments" :key="`legend-${seg.label}-${idx}`" class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full" :style="{ background: seg.color }" />
        <span class="font-mono text-[11px] text-content-soft flex-1 truncate">{{ seg.label }}</span>
        <span class="font-mono text-[11px] text-content">{{ seg.pct.toFixed(1) }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type DonutSegment = {
  label: string
  pct: number
  value?: number
}

const palette = ['#22c55e', '#3b82f6', '#f59e0b', '#a855f7', '#ef4444', '#14b8a6', '#84cc16']

const props = withDefaults(defineProps<{
  segments: DonutSegment[]
}>(), {})

const size = 220
const center = size / 2
const radius = 76
const stroke = 24
const circumference = 2 * Math.PI * radius

const totalPct = computed<number>(() => props.segments.reduce((sum, seg) => sum + Math.max(seg.pct, 0), 0))

const coloredSegments = computed<Array<DonutSegment & { color: string; len: number; offset: number }>>(() => {
  let offset = 0
  return props.segments.map((seg, idx) => {
    const safePct = Math.max(seg.pct, 0)
    const len = (safePct / 100) * circumference
    const mapped = {
      ...seg,
      color: palette[idx % palette.length],
      len,
      offset,
    }
    offset += len
    return mapped
  })
})
</script>
