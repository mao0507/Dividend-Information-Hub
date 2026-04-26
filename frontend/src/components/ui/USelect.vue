<template>
  <div class="relative">
    <select
      :value="modelValue"
      class="w-full appearance-none bg-surface-2 border border-border-strong rounded-[var(--radius)] text-sm text-content px-3 py-2 pr-8 font-mono focus:outline-none focus:ring-1 focus:ring-accent"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option
        v-for="opt in options"
        :key="opt.value"
        :value="opt.value"
        class="bg-surface-2"
      >
        {{ opt.label }}
      </option>
    </select>
    <span class="absolute right-2 top-1/2 -translate-y-1/2 text-content-faint pointer-events-none text-xs">▾</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string
  options: { value: string; label: string }[]
}>()
defineEmits<{ (e: 'update:modelValue', v: string): void }>()
</script>
