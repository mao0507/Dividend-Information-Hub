<template>
  <span :style="chipStyle" class="inline-flex items-center gap-1 font-mono text-[10px] font-medium tracking-wide rounded-[4px] px-[7px] py-[2px]">
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  color?: string
  bg?: string
}>(), {
  color: '#22c55e',
  bg: 'rgba(34,197,94,0.12)',
})

const chipStyle = computed(() => ({
  color: props.color,
  background: props.bg,
}))
</script>
