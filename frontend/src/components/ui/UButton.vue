<template>
  <button
    :class="[
      'inline-flex items-center justify-center gap-2 rounded-[var(--radius)] font-medium transition-opacity',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
      'disabled:opacity-40 disabled:cursor-not-allowed',
      sizeClass,
      variantClass,
    ]"
    :disabled="disabled || loading"
    v-bind="$attrs"
  >
    <span v-if="loading" class="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
}>(), {
  variant: 'primary',
  size: 'md',
})

const variantClass = computed(() => ({
  primary: 'bg-accent text-surface font-semibold hover:opacity-90',
  secondary: 'bg-surface-2 border border-border-strong text-content-soft hover:text-content',
  ghost: 'text-content-soft hover:text-content hover:bg-surface-2',
}[props.variant]))

const sizeClass = computed(() => ({
  sm: 'text-xs px-3 py-1.5',
  md: 'text-sm px-4 py-2',
  lg: 'text-sm px-5 py-3',
}[props.size]))
</script>
