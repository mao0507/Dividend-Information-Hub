<template>
  <div ref="containerRef" class="relative">
    <button
      ref="triggerRef"
      type="button"
      :class="[themedSelectTriggerClass, 'pr-8']"
      role="combobox"
      aria-haspopup="listbox"
      :aria-expanded="String(isOpen)"
      @click="toggleOpen"
      @keydown="handleKeydown"
    >
      {{ selectedLabel }}
      <ThemedIcon
        name="chevron-down"
        class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-content-faint"
        size-class="w-3.5 h-3.5"
      />
    </button>
    <ul
      v-if="isOpen"
      :class="themedSelectListClass"
      role="listbox"
    >
      <li
        v-for="(opt, index) in options"
        :key="opt.value"
        role="option"
        :aria-selected="opt.value === modelValue"
        :class="[
          themedSelectOptionClass,
          index === focusIndex ? 'bg-surface-2' : '',
          opt.value === modelValue ? 'text-accent' : '',
        ]"
        @click="selectOption(opt.value)"
        @mouseenter="focusIndex = index"
      >
        {{ opt.label }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import ThemedIcon from '@/components/icons/ThemedIcon.vue'
import {
  themedSelectListClass,
  themedSelectOptionClass,
  themedSelectTriggerClass,
} from '@/constants/form-control-styles'

const props = defineProps<{
  modelValue: string
  options: { value: string; label: string }[]
}>()

const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>()

const isOpen = ref<boolean>(false)
const focusIndex = ref<number>(-1)
const containerRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLButtonElement | null>(null)

/**
 * 目前選取項目的顯示文字
 * @returns 對應 option 的 label，找不到時 fallback 為 modelValue
 */
const selectedLabel = computed<string>(
  () => props.options.find((o) => o.value === props.modelValue)?.label ?? props.modelValue,
)

/**
 * 切換下拉清單開關，開啟時將焦點索引初始化至目前選取項
 */
const toggleOpen = (): void => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    focusIndex.value = props.options.findIndex((o) => o.value === props.modelValue)
  }
}

/**
 * 收合下拉清單並重置焦點索引
 */
const close = (): void => {
  isOpen.value = false
  focusIndex.value = -1
}

/**
 * 選取選項、emit 更新事件並收合清單
 * @param value 被選取的選項值
 */
const selectOption = (value: string): void => {
  emit('update:modelValue', value)
  close()
}

/**
 * 處理鍵盤事件：Enter/Space 展開、Arrow 導航、Enter 確認選取、Escape 關閉
 * @param e 鍵盤事件
 */
const handleKeydown = (e: KeyboardEvent): void => {
  if (!isOpen.value) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggleOpen()
    }
    return
  }

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    focusIndex.value = Math.min(focusIndex.value + 1, props.options.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    focusIndex.value = Math.max(focusIndex.value - 1, 0)
  } else if (e.key === 'Enter') {
    e.preventDefault()
    if (focusIndex.value >= 0) {
      selectOption(props.options[focusIndex.value].value)
    }
  } else if (e.key === 'Escape') {
    e.preventDefault()
    close()
    triggerRef.value?.focus()
  }
}

/**
 * 點擊元件外部時收合清單
 * @param e 滑鼠事件
 */
const onClickOutside = (e: MouseEvent): void => {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('mousedown', onClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', onClickOutside)
})
</script>
