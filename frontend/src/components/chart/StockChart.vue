<template>
  <svg
    :width="width"
    :height="height"
    :viewBox="`0 0 ${width} ${height}`"
    style="display:block;overflow:visible"
  >
    <defs>
      <linearGradient :id="gradId" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" :stop-color="accent" stop-opacity="0.35" />
        <stop offset="100%" :stop-color="accent" stop-opacity="0" />
      </linearGradient>
    </defs>

    <!-- Grid lines -->
    <g v-if="showGrid">
      <line
        v-for="(t, i) in yTicks"
        :key="i"
        :x1="PAD.l"
        :x2="width - PAD.r"
        :y1="yScale(t)"
        :y2="yScale(t)"
        stroke="rgba(255,255,255,0.05)"
        stroke-width="1"
        :stroke-dasharray="i === 0 ? '0' : '3 4'"
      />
      <text
        v-for="(t, i) in yTicks"
        :key="`yt-${i}`"
        :x="width - PAD.r + 8"
        :y="yScale(t) + 4"
        fill="rgba(255,255,255,0.4)"
        font-size="10"
        font-family="'JetBrains Mono', monospace"
      >{{ t.toFixed(0) }}</text>
    </g>

    <!-- X labels -->
    <text
      v-for="(m, i) in xLabels"
      :key="`xl-${i}`"
      :x="PAD.l + (i / (xLabels.length - 1)) * innerW"
      :y="height - PAD.b + 16"
      fill="rgba(255,255,255,0.4)"
      font-size="10"
      text-anchor="middle"
      font-family="'JetBrains Mono', monospace"
    >{{ m }}</text>

    <!-- Ex-div markers -->
    <g v-for="(d, i) in divPoints" :key="`div-${i}`">
      <line
        :x1="PAD.l + d * innerW"
        :x2="PAD.l + d * innerW"
        :y1="PAD.t"
        :y2="height - PAD.b"
        stroke="#ef4444"
        stroke-width="1"
        stroke-dasharray="2 3"
        opacity="0.5"
      />
      <circle
        :cx="PAD.l + d * innerW"
        :cy="PAD.t + 6"
        r="3"
        fill="#ef4444"
      />
    </g>

    <!-- Fill area -->
    <path :d="fillPath" :fill="`url(#${gradId})`" />

    <!-- Line -->
    <path
      :d="linePath"
      fill="none"
      :stroke="accent"
      stroke-width="1.8"
      stroke-linejoin="round"
      stroke-linecap="round"
    />

    <!-- Crosshair -->
    <g v-if="showCrosshair">
      <line
        :x1="xScale(hoverIdx)"
        :x2="xScale(hoverIdx)"
        :y1="PAD.t"
        :y2="height - PAD.b"
        stroke="rgba(255,255,255,0.4)"
        stroke-width="1"
        stroke-dasharray="3 3"
        opacity="0.5"
      />
      <circle
        :cx="xScale(hoverIdx)"
        :cy="yScale(series[hoverIdx])"
        r="5"
        fill="#0a0a0a"
        :stroke="accent"
        stroke-width="2"
      />
      <g :transform="`translate(${xScale(hoverIdx) + 10}, ${yScale(series[hoverIdx]) - 30})`">
        <rect x="0" y="0" width="90" height="40" rx="6" fill="rgba(255,255,255,0.08)" />
        <text x="10" y="16" fill="rgba(255,255,255,0.85)" font-size="10" font-family="'JetBrains Mono', monospace">04/02 · 週三</text>
        <text x="10" y="32" :fill="accent" font-size="13" font-family="'JetBrains Mono', monospace" font-weight="600">
          {{ series[hoverIdx]?.toFixed(2) }}
        </text>
      </g>
    </g>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  width?: number
  height?: number
  series?: number[]
  accent?: string
  divPoints?: number[]
  showGrid?: boolean
  showCrosshair?: boolean
}>(), {
  width: 800,
  height: 320,
  accent: '#22c55e',
  divPoints: () => [0.3, 0.6, 0.85],
  showGrid: true,
  showCrosshair: true,
})

const PAD = { l: 48, r: 56, t: 24, b: 28 }
const gradId = `sg-${Math.random().toString(36).slice(2, 7)}`

const series = computed(() => {
  if (props.series?.length) return props.series
  return makeSeries(180)
})

function makeSeries(n: number) {
  const pts: number[] = []
  let p = 100
  for (let i = 0; i < n; i++) {
    p *= 1 + (pseudoRng(i) - 0.48) * 0.018 + 0.0006
    pts.push(p)
  }
  return pts
}

function pseudoRng(i: number) {
  return Math.abs(Math.sin(i * 12.9898 + 78.233)) * 43758.5453 % 1
}

const innerW = computed(() => props.width - PAD.l - PAD.r)
const innerH = computed(() => props.height - PAD.t - PAD.b)

const minV = computed(() => Math.min(...series.value) * 0.995)
const maxV = computed(() => Math.max(...series.value) * 1.005)

const xScale = (i: number) => PAD.l + (i / (series.value.length - 1)) * innerW.value
const yScale = (v: number) => PAD.t + (1 - (v - minV.value) / (maxV.value - minV.value)) * innerH.value

const yTicks = computed(() => {
  const ticks = []
  for (let i = 0; i <= 4; i++) {
    ticks.push(minV.value + (maxV.value - minV.value) * (i / 4))
  }
  return ticks
})

const xLabels = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr']
const hoverIdx = computed(() => Math.floor(series.value.length * 0.72))

const linePath = computed(() =>
  series.value.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i).toFixed(1)} ${yScale(v).toFixed(1)}`).join(' ')
)

const fillPath = computed(() => {
  const last = series.value.length - 1
  return `${linePath.value} L ${xScale(last).toFixed(1)} ${yScale(minV.value).toFixed(1)} L ${xScale(0).toFixed(1)} ${yScale(minV.value).toFixed(1)} Z`
})
</script>
