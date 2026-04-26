<template>
  <button
    role="switch"
    :aria-checked="modelValue"
    :class="[
      'relative w-8 h-[18px] rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
      modelValue ? 'bg-accent' : 'bg-surface-3',
    ]"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <span
      :class="[
        'absolute top-[2px] w-[14px] h-[14px] rounded-full transition-all',
        modelValue ? 'left-[18px] bg-surface' : 'left-[2px] bg-content-soft',
      ]"
    />
  </button>
</template>

<script setup lang="ts">
defineProps<{ modelValue: boolean }>()
defineEmits<{ (e: 'update:modelValue', v: boolean): void }>()
</script>
