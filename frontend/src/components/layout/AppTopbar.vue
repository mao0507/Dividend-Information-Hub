<template>
  <header class="h-[52px] border-b border-border flex items-center px-5 gap-4 shrink-0">
    <!-- Breadcrumb -->
    <div class="flex items-center gap-2 text-[13px]">
      <span v-for="(crumb, i) in (breadcrumbs ?? [])" :key="i" class="flex items-center gap-2">
        <span :class="i < (breadcrumbs ?? []).length - 1 ? 'text-content-soft' : 'text-content'">{{ crumb }}</span>
        <span v-if="i < (breadcrumbs ?? []).length - 1" class="w-1 h-1 bg-content-faint rounded-full" />
      </span>
    </div>

    <div class="flex-1" />

    <!-- Real-time indicator -->
    <div class="flex items-center gap-1.5 px-2.5 py-[5px] bg-surface-2 rounded-[6px] text-[11px] font-mono text-content-soft">
      <span class="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_var(--accent)]" :style="{ background: 'var(--accent)' }" />
      台股即時 · {{ timeStr }}
    </div>

    <!-- Action buttons -->
    <div class="flex gap-1.5">
      <button
        v-for="icon in ['↓', '⌁', '⚙']"
        :key="icon"
        class="w-[30px] h-[30px] rounded-[6px] bg-surface-2 flex items-center justify-center text-[13px] text-content-soft hover:text-content transition-colors"
      >{{ icon }}</button>
    </div>

    <!-- Avatar -->
    <div class="w-[30px] h-[30px] rounded-full" style="background: linear-gradient(135deg, #3b82f6, #8b5cf6)" />
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

defineProps<{ breadcrumbs?: string[] }>()

const timeStr = ref('')

function updateTime() {
  const now = new Date()
  timeStr.value = now.toTimeString().slice(0, 8)
}

updateTime()
const timer = setInterval(updateTime, 1000)
onMounted(updateTime)
onUnmounted(() => clearInterval(timer))
</script>
