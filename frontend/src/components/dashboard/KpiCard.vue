<template>
  <div class="bg-surface-2 border border-border rounded-[var(--radius)] px-5 py-4 flex flex-col gap-2">
    <div class="flex items-center justify-between">
      <span class="font-mono text-[10px] text-content-faint uppercase tracking-widest">{{ label }}</span>
      <div
        class="w-6 h-6 rounded-md flex items-center justify-center text-[12px]"
        :style="{ background: `${accent}18` }"
      >{{ icon }}</div>
    </div>
    <div class="flex items-baseline gap-1.5">
      <span class="font-mono text-2xl font-semibold" :style="{ color: accent }">
        {{ typeof value === 'number' ? value.toLocaleString() : value }}
      </span>
      <span class="font-mono text-xs text-content-faint">{{ unit }}</span>
    </div>
    <div class="font-mono text-[10px] text-content-faint truncate">{{ sub }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value: number | string
  unit?: string
  sub?: string
  icon?: string
  accent?: string
}>()
</script>
