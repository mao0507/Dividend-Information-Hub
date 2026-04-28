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
        <div class="flex items-center justify-between mb-6">
          <div>
            <div class="font-mono text-xs uppercase tracking-widest text-content-faint">Login</div>
            <div class="text-lg text-content font-semibold mt-1">{{ currentStepTitle }}</div>
          </div>
          <button
            type="button"
            class="text-[11px] font-mono text-content-faint hover:text-content transition-colors"
            @click="goDashboard"
          >
            略過
          </button>
        </div>

        <div class="grid grid-cols-4 gap-2 mb-6">
          <div v-for="idx in [1, 2, 3, 4]" :key="idx" class="space-y-1">
            <div
              class="h-1.5 rounded-full transition-colors"
              :class="idx <= step ? 'bg-accent' : 'bg-surface-3'"
            />
            <div class="font-mono text-[10px]" :class="idx <= step ? 'text-content' : 'text-content-faint'">
              Step {{ idx }}
            </div>
          </div>
        </div>

        <form v-if="step === 1" class="space-y-4" @submit.prevent="submitAuth">
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
          <UButton type="submit" variant="primary" size="md" class="w-full" :loading="loading">
            {{ authMode === '登入' ? '登入並繼續' : '建立帳號並繼續' }}
          </UButton>
        </form>

        <div v-else-if="step === 2" class="space-y-4">
          <div class="space-y-1">
            <label class="font-mono text-[10px] text-content-faint uppercase tracking-widest">搜尋股票</label>
            <input
              v-model="searchText"
              class="w-full bg-surface-3 border border-border rounded-[6px] px-3 py-2 text-[13px] text-content outline-none focus:border-accent/60"
              placeholder="輸入代號或名稱"
            />
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="s in stockSuggestions"
              :key="s.code"
              type="button"
              class="px-2.5 py-1 rounded text-[11px] font-mono border transition-colors"
              :class="selectedCodes.includes(s.code) ? 'border-accent text-accent bg-accent/10' : 'border-border text-content-soft hover:text-content'"
              @click="toggleCode(s.code)"
            >
              {{ s.code }} {{ s.name }}
            </button>
          </div>
          <div class="text-[11px] font-mono text-content-faint">已選 {{ selectedCodes.length }} 檔</div>
          <div class="flex gap-2">
            <UButton variant="ghost" size="sm" class="flex-1" @click="step = 1">上一步</UButton>
            <UButton variant="primary" size="sm" class="flex-1" :loading="loading" @click="submitWatchlist">
              下一步
            </UButton>
          </div>
        </div>

        <div v-else-if="step === 3" class="space-y-4">
          <div class="text-[12px] text-content-soft">選擇通知管道與偏好：</div>
          <div class="space-y-2">
            <label class="flex items-center gap-2 text-[12px] text-content-soft">
              <input v-model="pref.inApp" type="checkbox" />
              App 內通知
            </label>
            <label class="flex items-center gap-2 text-[12px] text-content-soft">
              <input v-model="pref.email" type="checkbox" />
              Email（預留）
            </label>
            <label class="flex items-center gap-2 text-[12px] text-content-soft">
              <input v-model="pref.exDivAlert" type="checkbox" />
              除息前 3 天提醒
            </label>
          </div>
          <div class="flex gap-2">
            <UButton variant="ghost" size="sm" class="flex-1" @click="step = 2">上一步</UButton>
            <UButton variant="primary" size="sm" class="flex-1" :loading="loading" @click="submitPreference">
              下一步
            </UButton>
          </div>
        </div>

        <div v-else class="space-y-4">
          <div class="bg-surface-3 border border-border rounded-[10px] p-4 space-y-2">
            <div class="font-mono text-sm text-content inline-flex items-center gap-2">
              <ThemedIcon name="sparkles" size-class="w-4 h-4 text-accent" />
              設定完成
            </div>
            <div class="text-[12px] text-content-soft">帳號已啟用，自選股 {{ selectedCodes.length }} 檔，提醒規則已建立。</div>
          </div>
          <UButton variant="primary" size="md" class="w-full" @click="goDashboard">
            進入 Dashboard
          </UButton>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import UButton from '@/components/ui/UButton.vue'
import ThemedIcon from '@/components/icons/ThemedIcon.vue'
import { useAuthStore } from '@/stores/auth'
import { stockApi } from '@/api/stock'
import { watchlistApi } from '@/api/watchlist'
import { alertsApi } from '@/api/alerts'

type Suggestion = { code: string; name: string }

const router = useRouter()
const auth = useAuthStore()

const step = ref<number>(1)
const authModes = ['登入', '註冊'] as const
const authMode = ref<'登入' | '註冊'>('登入')

const currentStepTitle = computed<string>(() => {
  if (step.value === 1) return authMode.value === '登入' ? '登入' : '建立帳號'
  return ['', '加入自選股', '設定提醒偏好', '完成'][step.value - 1]
})
const loading = ref<boolean>(false)
const error = ref<string>('')

const authForm = ref<{ email: string; password: string; name: string }>({
  email: '',
  password: '',
  name: '',
})

const searchText = ref<string>('')
const suggestions = ref<Suggestion[]>([])
const selectedCodes = ref<string[]>([])

const pref = ref<{ inApp: boolean; email: boolean; exDivAlert: boolean }>({
  inApp: true,
  email: false,
  exDivAlert: true,
})

const stockSuggestions = computed<Suggestion[]>(() => suggestions.value.slice(0, 12))

/**
 * 跳轉到 Dashboard。
 * @returns {void}
 */
const goDashboard = (): void => {
  router.push('/dashboard')
}

/**
 * Step1：登入或註冊。
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
    step.value = 2
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : '登入/註冊失敗'
  } finally {
    loading.value = false
  }
}

/**
 * 切換股票代號選取狀態。
 * @param {string} code 股票代號
 * @returns {void}
 */
const toggleCode = (code: string): void => {
  if (selectedCodes.value.includes(code)) {
    selectedCodes.value = selectedCodes.value.filter((c) => c !== code)
    return
  }
  selectedCodes.value = [...selectedCodes.value, code]
}

/**
 * Step2：建立預設群組並加入自選股。
 * @returns {Promise<void>}
 */
const submitWatchlist = async (): Promise<void> => {
  loading.value = true
  try {
    if (selectedCodes.value.length > 0) {
      const group = await watchlistApi.createGroup('我的清單', '#22c55e')
      await Promise.all(selectedCodes.value.map((code) => watchlistApi.addItem(group.data.id, code)))
    }
    step.value = 3
  } finally {
    loading.value = false
  }
}

/**
 * Step3：依偏好建立預設提醒規則。
 * @returns {Promise<void>}
 */
const submitPreference = async (): Promise<void> => {
  loading.value = true
  try {
    if (pref.value.exDivAlert && pref.value.inApp) {
      await alertsApi.createRule({
        label: '除息前 3 天提醒',
        type: 'exDiv',
        matchType: 'watchlist',
        channels: ['inApp', ...(pref.value.email ? ['email'] : [])],
      })
    }
    step.value = 4
  } finally {
    loading.value = false
  }
}

/**
 * 以關鍵字搜尋股票建議。
 * @param {string} keyword 關鍵字
 * @returns {Promise<void>}
 */
const fetchSuggestions = async (keyword: string): Promise<void> => {
  if (!keyword.trim()) {
    suggestions.value = []
    return
  }
  try {
    const res = await stockApi.search(keyword, 12)
    suggestions.value = res.data.map((s) => ({ code: s.code, name: s.name }))
  } catch {
    suggestions.value = []
  }
}

/**
 * 載入預設熱門股票（作為 Step2 初始建議）。
 * @returns {Promise<void>}
 */
const loadDefaultSuggestions = async (): Promise<void> => {
  try {
    const res = await stockApi.getRanking({ limit: 8, page: 1 })
    suggestions.value = res.data.data.map((r) => ({ code: r.code, name: r.name }))
  } catch {
    suggestions.value = [
      { code: '2330', name: '台積電' },
      { code: '0056', name: '元大高股息' },
      { code: '00878', name: '國泰永續高股息' },
    ]
  }
}

watch(searchText, async (v: string) => {
  await fetchSuggestions(v)
})

onMounted(async () => {
  await loadDefaultSuggestions()
})
</script>
