<template>
  <div class="space-y-1.5">
    <div class="flex justify-between items-center">
      <span class="text-[11px] text-content-soft">{{ label }}</span>
      <span class="font-mono text-xs text-accent">{{ displayValue }}</span>
    </div>
    <div class="relative h-1 bg-surface-3 rounded-full">
      <div
        class="absolute left-0 top-0 h-full bg-accent rounded-full"
        :style="{ width: `${pct}%` }"
      />
      <input
        type="range"
        :min="min"
        :max="max"
        :step="step"
        :value="modelValue"
        class="absolute inset-0 w-full opacity-0 cursor-pointer h-4 -top-1.5"
        @input="$emit('update:modelValue', parseFloat(($event.target as HTMLInputElement).value))"
      />
      <div
        class="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-content rounded-full shadow ring-2 ring-surface pointer-events-none"
        :style="{ left: `${pct}%` }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  label: string
  modelValue: number
  min?: number
  max?: number
  step?: number
  unit?: string
  format?: (v: number) => string
}>(), {
  min: 0,
  max: 100,
  step: 1,
})

defineEmits<{ (e: 'update:modelValue', v: number): void }>()

const pct = computed(() => ((props.modelValue - props.min) / (props.max - props.min)) * 100)

const displayValue = computed(() => {
  if (props.format) return props.format(props.modelValue)
  const val = props.modelValue % 1 === 0 ? props.modelValue.toString() : props.modelValue.toFixed(1)
  return props.unit ? `${val}${props.unit}` : val
})
</script>
