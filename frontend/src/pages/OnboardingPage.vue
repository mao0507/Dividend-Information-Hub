<template>
  <div class="min-h-screen bg-surface flex items-center justify-center p-6">
    <div class="w-full max-w-[440px] bg-surface-2 border border-border-strong rounded-[var(--radius)] p-8 space-y-6">

      <!-- Logo -->
      <div class="text-center space-y-1">
        <div class="font-mono text-2xl font-bold text-content">
          股<span class="text-accent">息</span>站
        </div>
        <div class="text-[11px] text-content-faint font-mono">Dividend Information Hub</div>
      </div>

      <!-- Tabs -->
      <div class="flex bg-surface-3 rounded-[6px] p-0.5">
        <button
          v-for="t in ['登入', '註冊']"
          :key="t"
          :class="['flex-1 py-1.5 text-[12px] font-mono rounded-[4px] transition-colors', tab === t ? 'bg-surface-2 text-content' : 'text-content-soft']"
          @click="tab = t"
        >{{ t }}</button>
      </div>

      <!-- Form -->
      <form class="space-y-4" @submit.prevent="submit">
        <div v-if="tab === '註冊'" class="space-y-1">
          <label class="font-mono text-[10px] text-content-faint uppercase tracking-widest">暱稱（選填）</label>
          <input
            v-model="form.name"
            class="w-full bg-surface-3 border border-border rounded-[6px] px-3 py-2 text-[13px] text-content outline-none focus:border-accent/60 transition-colors font-mono placeholder:text-content-faint"
            placeholder="投資人"
          />
        </div>
        <div class="space-y-1">
          <label class="font-mono text-[10px] text-content-faint uppercase tracking-widest">Email</label>
          <input
            v-model="form.email"
            type="email"
            required
            class="w-full bg-surface-3 border border-border rounded-[6px] px-3 py-2 text-[13px] text-content outline-none focus:border-accent/60 transition-colors font-mono placeholder:text-content-faint"
            placeholder="you@example.com"
          />
        </div>
        <div class="space-y-1">
          <label class="font-mono text-[10px] text-content-faint uppercase tracking-widest">密碼</label>
          <input
            v-model="form.password"
            type="password"
            required
            minlength="8"
            class="w-full bg-surface-3 border border-border rounded-[6px] px-3 py-2 text-[13px] text-content outline-none focus:border-accent/60 transition-colors font-mono placeholder:text-content-faint"
            placeholder="••••••••"
          />
        </div>
        <div v-if="error" class="font-mono text-[11px] text-red-400 text-center">{{ error }}</div>
        <UButton type="submit" variant="primary" size="md" class="w-full" :loading="loading">
          {{ tab === '登入' ? '登入' : '建立帳號' }}
        </UButton>
      </form>

      <div class="text-center font-mono text-[10px] text-content-faint">
        測試帳號：test@example.com / password123
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import UButton from '@/components/ui/UButton.vue'

const router = useRouter()
const auth = useAuthStore()

const tab = ref('登入')
const loading = ref(false)
const error = ref('')
const form = ref({ email: '', password: '', name: '' })

async function submit() {
  error.value = ''
  loading.value = true
  try {
    if (tab.value === '登入') {
      await auth.login(form.value.email, form.value.password)
    } else {
      await auth.register(form.value.email, form.value.password, form.value.name || undefined)
    }
    router.push('/dashboard')
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : '發生錯誤，請稍後再試'
  } finally {
    loading.value = false
  }
}
</script>
