<template>
  <AppLayout :breadcrumbs="['設定']">
    <div class="p-6 max-w-[1380px] mx-auto space-y-6">
      <div class="grid grid-cols-1 xl:grid-cols-[220px_1fr] gap-6">
        <aside class="bg-surface-2 border border-border rounded-[var(--radius)] p-3 h-fit">
          <button
            v-for="item in navItems"
            :key="item.id"
            type="button"
            :class="['w-full text-left px-3 py-2 rounded text-[12px] font-mono transition-colors', activeNav === item.id ? 'bg-accent/15 text-accent' : 'text-content-soft hover:text-content hover:bg-surface-3']"
            @click="activeNav = item.id"
          >
            {{ item.label }}
          </button>
        </aside>

        <section class="bg-surface-2 border border-border rounded-[var(--radius)] p-5 space-y-6">
          <template v-if="activeNav === 'brokers'">
            <div class="flex items-center justify-between">
              <h2 class="font-mono text-xs uppercase tracking-widest text-content-faint">證券戶連結</h2>
              <span class="text-[10px] font-mono text-content-faint">{{ brokers.length }} 已連結</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <article
                v-for="broker in brokerCards"
                :key="broker.name"
                class="border border-border rounded-[10px] p-4 bg-surface"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <div class="text-content text-[13px]">{{ broker.name }}</div>
                    <div class="text-[10px] font-mono text-content-faint mt-1">{{ brokerHint(broker.name) }}</div>
                  </div>
                  <span
                    v-if="isLinked(broker.name)"
                    class="text-[10px] font-mono px-2 py-1 rounded bg-accent/15 text-accent inline-flex items-center gap-1"
                  >
                    <span>已連結</span>
                    <ThemedIcon name="check" size-class="w-3 h-3" />
                  </span>
                  <button
                    v-else
                    type="button"
                    class="text-[10px] font-mono px-2 py-1 rounded border border-border text-content-soft hover:text-content"
                    @click="linkOneBroker(broker.name)"
                  >
                    立即連結
                  </button>
                </div>
              </article>
            </div>

            <div class="border border-border rounded-[10px] p-4 bg-surface space-y-2">
              <div class="font-mono text-[11px] text-content">資料安全說明</div>
              <ul class="text-[12px] text-content-soft space-y-1">
                <li>唯讀授權，不可交易</li>
                <li>OAuth token 會定期輪替</li>
                <li>支援 2FA 與裝置驗證（MVP 文案）</li>
              </ul>
            </div>

            <div class="border border-border rounded-[10px] p-4 bg-surface space-y-3">
              <div class="font-mono text-[11px] text-content">同步偏好</div>
              <label v-for="opt in syncOptions" :key="opt.key" class="flex items-center justify-between text-[12px] text-content-soft">
                <span>{{ opt.label }}</span>
                <input
                  v-model="syncPref[opt.key]"
                  type="checkbox"
                  :class="themedCheckboxClass"
                  @change="patchSyncPref"
                />
              </label>
            </div>
          </template>

          <template v-else-if="activeNav === 'appearance'">
            <div class="flex items-center justify-between">
              <h2 class="font-mono text-xs uppercase tracking-widest text-content-faint">外觀</h2>
              <button
                type="button"
                class="text-[10px] font-mono text-content-faint hover:text-content"
                @click="saveAppearance"
              >
                儲存設定
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="font-mono text-[10px] text-content-faint uppercase tracking-widest">Accent</label>
                <input v-model="appearance.accent" type="color" class="w-full h-10 bg-surface border border-border rounded" />
              </div>
              <div class="space-y-1">
                <label class="font-mono text-[10px] text-content-faint uppercase tracking-widest">Up Color</label>
                <USelect
                  :model-value="upRedOption"
                  :options="upColorOptions"
                  @update:model-value="setUpRedOption"
                />
              </div>
              <div class="space-y-1">
                <label class="font-mono text-[10px] text-content-faint uppercase tracking-widest">Density</label>
                <USelect
                  :model-value="densityOption"
                  :options="densityOptions"
                  @update:model-value="setDensityOption"
                />
              </div>
              <div class="space-y-1">
                <label class="font-mono text-[10px] text-content-faint uppercase tracking-widest">Radius</label>
                <input v-model.number="appearance.radius" type="range" min="0" max="20" step="1" class="w-full" />
                <div class="text-[10px] font-mono text-content-faint">{{ appearance.radius }} px</div>
              </div>
            </div>

            <div class="border border-border rounded-[10px] p-4 bg-surface">
              <div class="text-[12px] text-content-soft mb-2">字型</div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input v-model="appearance.sansFont" class="bg-surface-3 border border-border rounded px-2 py-2 text-[12px] text-content" placeholder="sans font" />
                <input v-model="appearance.monoFont" class="bg-surface-3 border border-border rounded px-2 py-2 text-[12px] text-content" placeholder="mono font" />
              </div>
            </div>
          </template>

          <template v-else>
            <div class="p-8 text-center text-content-faint font-mono text-sm">
              {{ navItems.find((n) => n.id === activeNav)?.label }} 區塊準備中
            </div>
          </template>
        </section>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import ThemedIcon from '@/components/icons/ThemedIcon.vue'
import USelect from '@/components/ui/USelect.vue'
import { settingsApi } from '@/api/settings'
import { themedCheckboxClass } from '@/constants/form-control-styles'
import { useTweaksStore } from '@/stores/tweaks'
import type { BrokerLink, SyncPreference, TweakSettings } from '@/types'

type NavId =
  | 'account'
  | 'profile'
  | 'notifications'
  | 'brokers'
  | 'subscription'
  | 'export'
  | 'appearance'
  | 'security'
  | 'about'

const navItems: Array<{ id: NavId; label: string }> = [
  { id: 'account', label: '帳號' },
  { id: 'profile', label: '個人資料' },
  { id: 'notifications', label: '通知' },
  { id: 'brokers', label: '證券戶連結' },
  { id: 'subscription', label: '訂閱' },
  { id: 'export', label: '資料匯出' },
  { id: 'appearance', label: '外觀' },
  { id: 'security', label: '安全' },
  { id: 'about', label: '關於' },
]

const brokerCards = [
  { name: '元大證券' },
  { name: '富邦證券' },
  { name: '永豐金證券' },
  { name: '國泰證券' },
]

const upColorOptions: Array<{ value: string; label: string }> = [
  { value: 'true', label: '上漲紅、下跌綠' },
  { value: 'false', label: '上漲綠、下跌紅' },
]

const densityOptions: Array<{ value: string; label: string }> = [
  { value: 'compact', label: 'compact' },
  { value: 'cozy', label: 'cozy' },
  { value: 'loose', label: 'loose' },
]

const syncOptions: Array<{ key: keyof SyncPreference; label: string }> = [
  { key: 'autoSync', label: '自動同步' },
  { key: 'positions', label: '部位資料' },
  { key: 'dividends', label: '股息紀錄' },
  { key: 'profile', label: '個人資料' },
  { key: 'notifications', label: '通知偏好' },
]

const tweaks = useTweaksStore()
const activeNav = ref<NavId>('brokers')
const brokers = ref<BrokerLink[]>([])
const syncPref = ref<SyncPreference>({
  autoSync: true,
  positions: true,
  dividends: true,
  profile: false,
  notifications: true,
})

const appearance = ref<TweakSettings>({
  accent: '#22c55e',
  upRed: true,
  density: 'cozy',
  monoFont: 'JetBrains Mono',
  sansFont: 'Inter',
  radius: 10,
})

const upRedOption = ref<string>('true')
const densityOption = ref<string>('cozy')

/**
 * 判斷券商是否已連結。
 * @param brokerName 券商名稱
 * @returns 是否連結
 */
const isLinked = (brokerName: string): boolean =>
  brokers.value.some((b) => b.broker === brokerName)

/**
 * 券商提示文案。
 * @param brokerName 券商名稱
 * @returns 說明文字
 */
const brokerHint = (brokerName: string): string =>
  isLinked(brokerName) ? 'OAuth 已授權 / 唯讀' : '尚未連結'

/**
 * 連結單一券商（MVP 記錄）。
 * @param brokerName 券商名稱
 */
const linkOneBroker = async (brokerName: string): Promise<void> => {
  try {
    const res = await settingsApi.linkBroker({ broker: brokerName })
    brokers.value = [res.data, ...brokers.value]
  } catch {
    // ignore
  }
}

/**
 * 更新同步偏好到後端。
 */
const patchSyncPref = async (): Promise<void> => {
  try {
    const res = await settingsApi.patchSync(syncPref.value)
    syncPref.value = res.data
  } catch {
    // ignore
  }
}

/**
 * 儲存外觀設定到後端並同步本地 Tweaks。
 */
const saveAppearance = async (): Promise<void> => {
  try {
    const res = await settingsApi.patchSettings({
      accent: appearance.value.accent,
      upRed: appearance.value.upRed,
      density: appearance.value.density,
      monoFont: appearance.value.monoFont,
      sansFont: appearance.value.sansFont,
      radius: appearance.value.radius,
    })
    appearance.value = {
      accent: res.data.accent,
      upRed: res.data.upRed,
      density: (res.data.density as TweakSettings['density']) ?? 'cozy',
      monoFont: res.data.monoFont,
      sansFont: res.data.sansFont,
      radius: res.data.radius,
    }
    tweaks.setAll(appearance.value)
  } catch {
    // ignore
  }
}

/**
 * 變更上漲顏色配置（字串值轉布林）
 * @param value 選項值
 */
const setUpRedOption = (value: string): void => {
  upRedOption.value = value
  appearance.value.upRed = value === 'true'
}

/**
 * 變更顯示密度
 * @param value 選項值
 */
const setDensityOption = (value: string): void => {
  densityOption.value = value
  appearance.value.density = value as TweakSettings['density']
}

watch(
  appearance,
  (next) => {
    upRedOption.value = String(next.upRed)
    densityOption.value = next.density
    tweaks.setAll(next)
  },
  { deep: true },
)

onMounted(async () => {
  try {
    const [settingsRes, brokersRes] = await Promise.all([
      settingsApi.getSettings(),
      settingsApi.getBrokers(),
    ])
    appearance.value = {
      accent: settingsRes.data.accent,
      upRed: settingsRes.data.upRed,
      density: (settingsRes.data.density as TweakSettings['density']) ?? 'cozy',
      monoFont: settingsRes.data.monoFont,
      sansFont: settingsRes.data.sansFont,
      radius: settingsRes.data.radius,
    }
    tweaks.setAll(appearance.value)
    brokers.value = brokersRes.data
  } catch {
    // ignore
  }
})
</script>
