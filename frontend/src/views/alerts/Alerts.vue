<template>
  <AppLayout :breadcrumbs="['提醒中心']">
    <div class="p-6 max-w-[1400px] mx-auto">
      <div class="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
        <section class="bg-surface-2 border border-border rounded-[var(--radius)] overflow-hidden">
          <div class="px-4 py-3 border-b border-border flex items-center gap-2 flex-wrap">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              type="button"
              :class="['px-2.5 py-1 rounded text-[11px] font-mono transition-colors', activeTab === tab.id ? 'bg-accent/20 text-accent' : 'text-content-soft hover:text-content hover:bg-surface-3']"
              @click="activeTab = tab.id"
            >
              {{ tab.label }}
              <span v-if="tab.id === 'unread'" class="ml-1 text-[10px]">({{ unreadCount }})</span>
            </button>
            <div class="flex-1" />
            <button
              type="button"
              class="px-2.5 py-1 rounded text-[10px] font-mono text-content-faint hover:text-content transition-colors border border-border"
              @click="markAllRead"
            >
              全部標示已讀
            </button>
          </div>

          <div class="divide-y divide-border">
            <article
              v-for="n in displayNotifications"
              :key="n.id"
              class="px-4 py-3 cursor-pointer hover:bg-surface-3 transition-colors"
              @click="markRead(n.id)"
            >
              <div class="flex items-start gap-3">
                <ThemedIcon
                  :name="notificationIconName(n.type)"
                  size-class="w-4 h-4 text-content-soft shrink-0 mt-0.5"
                />
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <h3 class="text-[13px] text-content truncate">{{ n.title }}</h3>
                    <span
                      v-if="n.stockCode"
                      class="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface text-content-faint"
                    >{{ n.stockCode }}</span>
                    <span
                      v-if="!n.isRead"
                      class="w-1.5 h-1.5 rounded-full bg-accent"
                    />
                  </div>
                  <p class="text-[12px] text-content-soft mt-1">{{ n.body }}</p>
                  <div class="text-[10px] font-mono text-content-faint mt-1">{{ fmtDate(n.createdAt) }}</div>
                </div>
              </div>
            </article>
            <div v-if="!displayNotifications.length" class="px-4 py-10 text-center text-content-faint text-[12px] font-mono">
              暫無通知
            </div>
          </div>
        </section>

        <aside class="bg-surface-2 border border-border rounded-[var(--radius)] p-4 space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="font-mono text-xs uppercase tracking-widest text-content-faint">提醒規則</h2>
            <span class="text-[10px] font-mono text-content-faint">{{ rules.length }} 條</span>
          </div>

          <div class="space-y-2">
            <article
              v-for="rule in rules"
              :key="rule.id"
              class="p-3 rounded border border-border bg-surface"
            >
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  class="w-9 h-5 rounded-full relative transition-colors"
                  :class="rule.isOn ? 'bg-accent/40' : 'bg-surface-3'"
                  @click="toggleRule(rule.id, !rule.isOn)"
                >
                  <span
                    class="absolute top-0.5 w-4 h-4 rounded-full bg-content transition-all"
                    :class="rule.isOn ? 'left-4' : 'left-0.5'"
                  />
                </button>
                <div class="flex-1 min-w-0">
                  <div class="text-[12px] text-content truncate">{{ rule.label }}</div>
                  <div class="text-[10px] font-mono text-content-faint truncate">
                    {{ rule.type }} · {{ rule.matchType }} · {{ (rule.channels ?? []).join(', ') || 'inApp' }}
                  </div>
                </div>
                <button
                  type="button"
                  class="text-[10px] font-mono text-content-faint hover:text-danger transition-colors"
                  @click="removeRule(rule.id)"
                >
                  刪除
                </button>
              </div>
            </article>
          </div>

          <div class="pt-2 border-t border-border space-y-2">
            <div class="font-mono text-[10px] uppercase tracking-widest text-content-faint">新增規則</div>
            <input
              v-model="newRule.label"
              class="w-full bg-surface border border-border rounded px-2.5 py-1.5 text-[12px] text-content outline-none focus:border-accent/60"
              placeholder="例如：台積電除息提醒"
            />
            <div class="grid grid-cols-2 gap-2">
              <Select
                v-model="newRule.type"
                :options="ruleTypeOptions"
                option-label="label"
                option-value="value"
              />
              <input
                v-model="newRule.stockCode"
                class="w-full bg-surface border border-border rounded px-2 py-1.5 text-[12px] text-content outline-none focus:border-accent/60"
                placeholder="代號(可選)"
              />
            </div>
            <button
              type="button"
              class="w-full px-3 py-1.5 rounded bg-accent/20 text-accent text-[11px] font-mono hover:bg-accent/25 transition-colors"
              @click="createRule"
            >
              新增規則
            </button>
          </div>

          <div class="pt-2 border-t border-border">
            <div class="font-mono text-[10px] uppercase tracking-widest text-content-faint mb-2">通知管道狀態</div>
            <div class="grid grid-cols-3 gap-2 text-[10px] font-mono">
              <div class="px-2 py-1 rounded bg-surface border border-border text-content-soft text-center inline-flex items-center justify-center gap-1">
                <span>In-App</span>
                <ThemedIcon name="check" size-class="w-3 h-3 text-accent" />
              </div>
              <div class="px-2 py-1 rounded bg-surface border border-border text-content-faint text-center">Email -</div>
              <div class="px-2 py-1 rounded bg-surface border border-border text-content-faint text-center">LINE -</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import ThemedIcon from '@/components/icons/ThemedIcon.vue'
import Select from 'primevue/select'
import type { ThemedIconName } from '@/components/icons/ThemedIcon.vue'
import { alertsApi } from '@/services/api/alerts'
import type { AlertRule, Notification } from '@/types'

type NotificationTab = 'all' | 'exDiv' | 'payment' | 'news' | 'unread'

const tabs: Array<{ id: NotificationTab; label: string }> = [
  { id: 'all', label: '全部' },
  { id: 'exDiv', label: '除息' },
  { id: 'payment', label: '發放' },
  { id: 'news', label: '新聞' },
  { id: 'unread', label: '未讀' },
]

const activeTab = ref<NotificationTab>('all')
const notifications = ref<Notification[]>([])
const rules = ref<AlertRule[]>([])

const newRule = ref<{ label: string; type: string; stockCode: string }>({
  label: '',
  type: 'exDiv',
  stockCode: '',
})

const ruleTypeOptions: Array<{ value: string; label: string }> = [
  { value: 'exDiv', label: '除息' },
  { value: 'payment', label: '發放' },
  { value: 'fill', label: '填息' },
  { value: 'yield', label: '殖利率' },
  { value: 'drop', label: '跌幅' },
  { value: 'announce', label: '公告' },
]

const unreadCount = computed<number>(() => notifications.value.filter((n) => !n.isRead).length)

const displayNotifications = computed<Notification[]>(() => {
  if (activeTab.value === 'unread') return notifications.value.filter((n) => !n.isRead)
  if (activeTab.value === 'all') return notifications.value
  return notifications.value.filter((n) => n.type === activeTab.value)
})

/**
 * 取得提醒中心初始化資料
 * @returns Promise<void>
 */
const loadAlerts = async (): Promise<void> => {
  try {
    const [notiRes, ruleRes] = await Promise.all([
      alertsApi.getNotifications({ page: 1 }),
      alertsApi.getRules(),
    ])
    notifications.value = notiRes.data.data
    rules.value = ruleRes.data
  } catch {
    notifications.value = []
    rules.value = []
  }
}

/**
 * 單筆標示已讀
 * @param id 通知 id
 * @returns Promise<void>
 */
const markRead = async (id: string): Promise<void> => {
  const row = notifications.value.find((n) => n.id === id)
  if (!row || row.isRead) return
  row.isRead = true
  try {
    await alertsApi.readNotification(id)
  } catch {
    row.isRead = false
  }
}

/**
 * 全部標示已讀
 * @returns Promise<void>
 */
const markAllRead = async (): Promise<void> => {
  const prev = notifications.value.map((n) => ({ id: n.id, isRead: n.isRead }))
  notifications.value = notifications.value.map((n) => ({ ...n, isRead: true }))
  try {
    await alertsApi.readAllNotifications()
  } catch {
    notifications.value = notifications.value.map((n) => {
      const p = prev.find((v) => v.id === n.id)
      return { ...n, isRead: p?.isRead ?? n.isRead }
    })
  }
}

/**
 * 切換規則開關
 * @param id 規則 id
 * @param isOn 新狀態
 * @returns Promise<void>
 */
const toggleRule = async (id: string, isOn: boolean): Promise<void> => {
  const target = rules.value.find((r) => r.id === id)
  if (!target) return
  const prev = target.isOn
  target.isOn = isOn
  try {
    await alertsApi.updateRule(id, { isOn })
  } catch {
    target.isOn = prev
  }
}

/**
 * 刪除規則
 * @param id 規則 id
 * @returns Promise<void>
 */
const removeRule = async (id: string): Promise<void> => {
  const prev = [...rules.value]
  rules.value = rules.value.filter((r) => r.id !== id)
  try {
    await alertsApi.deleteRule(id)
  } catch {
    rules.value = prev
  }
}

/**
 * 新增規則
 * @returns Promise<void>
 */
const createRule = async (): Promise<void> => {
  if (!newRule.value.label.trim()) return
  try {
    const res = await alertsApi.createRule({
      label: newRule.value.label.trim(),
      type: newRule.value.type,
      stockCode: newRule.value.stockCode.trim() || undefined,
      matchType: 'watchlist',
      channels: ['inApp'],
    })
    rules.value = [res.data, ...rules.value]
    newRule.value = { label: '', type: 'exDiv', stockCode: '' }
  } catch {
    // no-op
  }
}

/**
 * 類型對應主題向量圖示名稱
 * @param type 通知類型
 * @returns ThemedIcon 名稱
 */
const notificationIconName = (type: string): ThemedIconName => {
  switch (type) {
    case 'exDiv':
      return 'bolt'
    case 'payment':
      return 'banknotes'
    case 'fill':
      return 'chart-bar'
    case 'yield':
      return 'calculator'
    case 'drop':
      return 'arrow-trending-down'
    case 'news':
    case 'announce':
      return 'newspaper'
    default:
      return 'bell'
  }
}

/**
 * 格式化通知時間
 * @param iso ISO 時間字串
 * @returns 可讀時間
 */
const fmtDate = (iso: string): string =>
  new Date(iso).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

watch(activeTab, async (tab: NotificationTab) => {
  if (tab === 'all' || tab === 'unread' || tab === 'news') return
  try {
    const res = await alertsApi.getNotifications({ type: tab, page: 1 })
    const map = new Map(notifications.value.map((n) => [n.id, n]))
    res.data.data.forEach((n) => map.set(n.id, n))
    notifications.value = [...map.values()].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
  } catch {
    // no-op
  }
})

onMounted(async () => {
  await loadAlerts()
})
</script>
