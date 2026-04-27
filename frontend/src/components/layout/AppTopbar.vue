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
        v-for="action in actions"
        :key="action.key"
        type="button"
        :aria-label="action.label"
        :title="action.label"
        class="w-[30px] h-[30px] rounded-[6px] bg-surface-2 flex items-center justify-center text-content-soft hover:text-content transition-colors"
        @click="onActionClick(action.to)"
      >
        <ThemedIcon :name="action.icon" size-class="w-[15px] h-[15px]" />
      </button>
    </div>

    <!-- Avatar -->
    <div class="w-[30px] h-[30px] rounded-full" style="background: linear-gradient(135deg, #3b82f6, #8b5cf6)" />
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import ThemedIcon from '@/components/icons/ThemedIcon.vue'
import type { ThemedIconName } from '@/components/icons/ThemedIcon.vue'

defineProps<{ breadcrumbs?: string[] }>()

const router = useRouter()
const timeStr = ref('')

const actions: ReadonlyArray<{ key: string; icon: ThemedIconName; label: string; to: string }> = [
  { key: 'export', icon: 'arrow-down-tray', label: '前往匯出設定', to: '/settings' },
  { key: 'alerts', icon: 'bell', label: '前往提醒中心', to: '/alerts' },
  { key: 'settings', icon: 'cog-6-tooth', label: '前往設定', to: '/settings' },
]

/**
 * 更新即時時間字串。
 * @returns {void}
 */
const updateTime = (): void => {
  const now = new Date()
  timeStr.value = now.toTimeString().slice(0, 8)
}

/**
 * 點擊 Topbar action 後導向目標路由。
 * @param {string} to 目標路由
 * @returns {Promise<void>}
 */
const onActionClick = async (to: string): Promise<void> => {
  await router.push(to)
}

updateTime()
const timer = setInterval(updateTime, 1000)
onMounted(updateTime)
onUnmounted(() => clearInterval(timer))
</script>
