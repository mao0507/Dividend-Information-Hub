<template>
  <div class="min-h-screen bg-surface text-content flex items-center justify-center p-6">
    <div class="w-full max-w-[640px] bg-surface-2 border border-border rounded-[var(--radius)] p-8 md:p-10 text-center space-y-6">
      <div class="space-y-2">
        <div class="font-mono text-[12px] uppercase tracking-[0.2em] text-content-faint">401</div>
        <h1 class="text-3xl md:text-4xl font-semibold">尚未登入或 Session 已過期</h1>
        <p class="text-content-soft text-sm md:text-base">
          您的登入狀態已失效，請重新登入後繼續操作。
        </p>
      </div>

      <div class="flex justify-center">
        <button
          type="button"
          aria-label="回到登入頁"
          class="px-4 py-2 rounded-[8px] bg-accent/20 text-accent font-mono text-[12px] hover:bg-accent/25 transition-colors"
          @click="goLogin"
        >
          回到登入頁
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

/**
 * 導向登入頁。
 * @returns {Promise<void>}
 */
const goLogin = async (): Promise<void> => {
  await router.push('/login')
}
</script>
