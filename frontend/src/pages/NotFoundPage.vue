<template>
  <div class="min-h-screen bg-surface text-content flex items-center justify-center p-6">
    <div class="w-full max-w-[640px] bg-surface-2 border border-border rounded-[var(--radius)] p-8 md:p-10 text-center space-y-6">
      <div class="space-y-2">
        <div class="font-mono text-[12px] uppercase tracking-[0.2em] text-content-faint">404</div>
        <h1 class="text-3xl md:text-4xl font-semibold">找不到這個頁面</h1>
        <p class="text-content-soft text-sm md:text-base">
          你前往的網址不存在，可能已被移動或輸入錯誤。
        </p>
      </div>

      <div class="flex flex-col sm:flex-row gap-2 justify-center">
        <button
          type="button"
          aria-label="回到儀表板"
          class="px-4 py-2 rounded-[8px] bg-accent/20 text-accent font-mono text-[12px] hover:bg-accent/25 transition-colors"
          @click="goDashboard"
        >
          回到儀表板
        </button>
        <button
          type="button"
          aria-label="返回上一頁"
          class="px-4 py-2 rounded-[8px] border border-border text-content-soft font-mono text-[12px] hover:text-content hover:bg-surface-3 transition-colors"
          @click="goBack"
        >
          返回上一頁
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

/**
 * 導向儀表板。
 * @returns {Promise<void>}
 */
const goDashboard = async (): Promise<void> => {
  await router.push('/dashboard')
}

/**
 * 返回上一頁；若無可回上一頁則改導向儀表板。
 * @returns {Promise<void>}
 */
const goBack = async (): Promise<void> => {
  if (window.history.length > 1) {
    router.back()
    return
  }
  await router.push('/dashboard')
}
</script>
