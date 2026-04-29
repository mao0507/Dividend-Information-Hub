<template>
  <div class="min-h-screen bg-surface grid grid-cols-1 xl:grid-cols-2">
    <section class="hidden xl:flex relative overflow-hidden border-r border-border">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,197,94,0.2),transparent_55%),radial-gradient(circle_at_80%_30%,rgba(59,130,246,0.18),transparent_52%),linear-gradient(135deg,#0a0a0b,#101013)]" />
      <div class="relative z-10 p-10 w-full flex flex-col justify-between">
        <div>
          <div class="font-mono text-3xl font-bold text-content">
            股<span class="text-accent">息</span>站
          </div>
          <p class="mt-3 text-content-soft max-w-[420px]">
            建立你的股息資料中樞：從自選股、提醒規則到收益視覺化，3 分鐘完成初始設定。
          </p>
        </div>
        <div class="grid grid-cols-3 gap-3 max-w-[540px]">
          <div class="bg-surface-2/80 border border-border rounded-[10px] p-4">
            <div class="font-mono text-xs text-content-faint">Coverage</div>
            <div class="font-mono text-2xl text-content mt-1">50+</div>
            <div class="text-xs text-content-soft">台股與 ETF</div>
          </div>
          <div class="bg-surface-2/80 border border-border rounded-[10px] p-4">
            <div class="font-mono text-xs text-content-faint">Latency</div>
            <div class="font-mono text-2xl text-content mt-1">&lt;1s</div>
            <div class="text-xs text-content-soft">提醒與查詢</div>
          </div>
          <div class="bg-surface-2/80 border border-border rounded-[10px] p-4">
            <div class="font-mono text-xs text-content-faint">Automation</div>
            <div class="font-mono text-2xl text-content mt-1">24/7</div>
            <div class="text-xs text-content-soft">追蹤除息事件</div>
          </div>
        </div>
      </div>
    </section>

    <section class="p-6 md:p-10 flex items-center justify-center">
      <div class="w-full max-w-[560px] bg-surface-2 border border-border-strong rounded-[var(--radius)] p-6 md:p-8">
        <div class="mb-6">
          <div class="font-mono text-xs uppercase tracking-widest text-content-faint">
            {{ authMode === '登入' ? 'Login' : 'Register' }}
          </div>
          <div class="text-lg text-content font-semibold mt-1">
            {{ authMode === '登入' ? '登入' : '建立帳號' }}
          </div>
        </div>

        <form class="space-y-4" @submit.prevent="submitAuth">
          <div class="flex bg-surface-3 rounded-[6px] p-0.5">
            <button
              v-for="mode in authModes"
              :key="mode"
              type="button"
              :class="['flex-1 py-1.5 text-[12px] font-mono rounded-[4px] transition-colors', authMode === mode ? 'bg-surface-2 text-content' : 'text-content-soft']"
              @click="authMode = mode"
            >{{ mode }}</button>
          </div>
          <div v-if="authMode === '註冊'" class="space-y-1">
            <label class="font-mono text-[10px] text-content-faint uppercase tracking-widest">暱稱（選填）</label>
            <input
              v-model="authForm.name"
              class="w-full bg-surface-3 border border-border rounded-[6px] px-3 py-2 text-[13px] text-content outline-none focus:border-accent/60"
              placeholder="投資人"
            />
          </div>
          <div class="space-y-1">
            <label class="font-mono text-[10px] text-content-faint uppercase tracking-widest">Email</label>
            <input
              v-model="authForm.email"
              type="email"
              required
              class="w-full bg-surface-3 border border-border rounded-[6px] px-3 py-2 text-[13px] text-content outline-none focus:border-accent/60"
              placeholder="you@example.com"
            />
          </div>
          <div class="space-y-1">
            <label class="font-mono text-[10px] text-content-faint uppercase tracking-widest">密碼</label>
            <input
              v-model="authForm.password"
              type="password"
              minlength="8"
              required
              class="w-full bg-surface-3 border border-border rounded-[6px] px-3 py-2 text-[13px] text-content outline-none focus:border-accent/60"
              placeholder="••••••••"
            />
          </div>
          <div v-if="error" class="text-[11px] text-danger font-mono text-center">{{ error }}</div>
          <Button type="submit" class="w-full" :loading="loading">
            {{ authMode === '登入' ? '登入' : '建立帳號' }}
          </Button>
        </form>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const authModes = ['登入', '註冊'] as const
const authMode = ref<'登入' | '註冊'>('登入')
const loading = ref<boolean>(false)
const error = ref<string>('')

const authForm = ref<{ email: string; password: string; name: string }>({
  email: '',
  password: '',
  name: '',
})

if (import.meta.env.DEV) {
  authForm.value.email = import.meta.env.VITE_TEST_EMAIL
  authForm.value.password = import.meta.env.VITE_TEST_PASSWORD
}


/**
 * 登入或註冊，成功後導向 Dashboard。
 * @returns {Promise<void>}
 */
const submitAuth = async (): Promise<void> => {
  error.value = ''
  loading.value = true
  try {
    if (authMode.value === '登入') {
      await auth.login(authForm.value.email, authForm.value.password)
    } else {
      await auth.register(authForm.value.email, authForm.value.password, authForm.value.name || undefined)
    }
    await router.push('/dashboard')
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : '登入/註冊失敗'
  } finally {
    loading.value = false
  }
}
</script>
