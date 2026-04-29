<template>
  <AppLayout :breadcrumbs="['自選股']">
    <div class="relative flex h-full overflow-hidden">
      <!-- 分組側欄 -->
      <aside class="w-[200px] shrink-0 border-r border-border flex flex-col p-3 gap-2 overflow-y-auto">
        <div class="text-[10px] font-mono text-content-faint uppercase tracking-widest">分組</div>
        <button
          v-for="g in groups"
          :key="g.id"
          type="button"
          :class="groupSidebarBtnClass(g)"
          @click="activeGroupId = g.id"
        >
          <span class="w-2 h-2 rounded-full shrink-0" :style="{ background: g.color }"></span>
          <span class="truncate flex-1">{{ g.name }}</span>
          <span class="font-mono text-[10px] text-content-faint">{{ g.items.length }}</span>
        </button>
        <Button size="small" severity="secondary" class="mt-1" @click="promptNewGroup">＋ 新增分組</Button>
      </aside>

      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <!-- 摘要 -->
        <div class="shrink-0 grid grid-cols-2 xl:grid-cols-4 gap-3 p-4 border-b border-border">
          <div class="bg-surface-2 border border-border rounded-[var(--radius)] px-4 py-3">
            <div class="text-[10px] font-mono text-content-faint uppercase">自選股</div>
            <div class="text-xl font-mono font-semibold text-content">{{ summary?.totalStocks ?? '—' }}</div>
            <div class="text-[10px] text-content-faint">檔數（去重）</div>
          </div>
          <div class="bg-surface-2 border border-border rounded-[var(--radius)] px-4 py-3">
            <div class="text-[10px] font-mono text-content-faint uppercase">總市值</div>
            <div class="text-xl font-mono font-semibold text-content">
              {{ summary ? formatMoney(summary.totalValue) : '—' }}
            </div>
          </div>
          <div class="bg-surface-2 border border-border rounded-[var(--radius)] px-4 py-3">
            <div class="text-[10px] font-mono text-content-faint uppercase">今年領息</div>
            <div class="text-xl font-mono font-semibold text-accent">
              {{ summary ? formatMoney(summary.yearIncome) : '—' }}
            </div>
          </div>
          <div class="bg-surface-2 border border-border rounded-[var(--radius)] px-4 py-3">
            <div class="text-[10px] font-mono text-content-faint uppercase">待除息</div>
            <div class="text-xl font-mono font-semibold text-content">{{ summary?.pendingExDiv ?? '—' }}</div>
            <div class="text-[10px] text-content-faint">筆（今年內）</div>
          </div>
        </div>

        <div class="shrink-0 px-4 py-2 flex flex-wrap gap-2 items-center border-b border-border">
          <input
            v-model="searchQ"
            type="search"
            placeholder="搜尋代號或名稱 (Enter)"
            class="flex-1 min-w-[160px] max-w-md bg-surface-2 border border-border rounded-[var(--radius)] px-3 py-2 text-sm font-mono text-content placeholder:text-content-faint focus:outline-none focus:ring-1 focus:ring-accent"
            @keydown.enter="runSearch"
          />
          <Button size="small" text class="font-mono text-[11px]" @click="openSearchHint">⌘K</Button>
          <Button size="small" @click="showAdd = true">新增至自選</Button>
        </div>

        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          <div v-if="loading" class="py-12 text-center text-content-faint font-mono text-sm">載入中...</div>
          <div v-if="!loading" class="space-y-4">
            <section
              v-for="group in groups"
              :key="group.id"
              class="bg-surface-2 border border-border rounded-[var(--radius)] overflow-hidden"
            >
              <div class="px-4 py-3 border-b border-border flex items-center gap-2">
                <span class="w-2 h-2 rounded-full" :style="{ background: group.color }"></span>
                <span class="font-mono text-sm font-semibold text-content">{{ group.name }}</span>
                <span class="text-[11px] text-content-faint font-mono">{{ group.items.length }} 檔</span>
                <div class="flex-1"></div>
                <Button size="small" text @click="deleteGroupSafe(group)">刪除分組</Button>
              </div>

              <div
                :id="'wl-sort-' + group.id"
                class="divide-y divide-border wl-sort-root"
              >
                <div
                  v-for="item in group.items"
                  :key="item.id"
                  class="wl-sort-row px-3 py-2.5 flex items-center gap-3 hover:bg-surface-3/50 transition-colors"
                >
                  <span class="drag-handle cursor-grab text-content-faint font-mono text-[12px] select-none">⋮⋮</span>
                  <div class="flex-1 min-w-0 cursor-pointer" @click="goStock(item.stockCode)">
                    <div class="flex items-baseline gap-2">
                      <span class="font-mono text-[12px] text-accent">{{ item.stockCode }}</span>
                      <span class="text-[13px] text-content font-medium truncate">{{ item.stock.name }}</span>
                    </div>
                    <div class="flex flex-wrap gap-1 mt-0.5">
                      <Chip :pt="{ root: { style: { color: '#94a3b8', background: 'rgba(148,163,184,0.12)' } } }">{{ item.stock.sector }}</Chip>
                      <span v-if="nextExLabel(item)" class="text-[10px] font-mono text-content-faint">
                        除息 {{ nextExLabel(item) }}
                      </span>
                    </div>
                  </div>
                  <div class="w-[72px] h-7 shrink-0 bg-surface-3/80 rounded-[4px]" aria-hidden="true"></div>
                  <div class="w-[76px] text-right shrink-0">
                    <div class="font-mono text-[12px] text-content">{{ displayPrice(item).toFixed(2) }}</div>
                    <div :class="['font-mono text-[10px]', isPriceUp(item) ? 'text-up' : 'text-down']">
                      {{ isPriceUp(item) ? '+' : '' }}{{ priceChange(item).toFixed(2) }}%
                    </div>
                  </div>
                  <div class="w-[52px] text-right shrink-0 hidden sm:block">
                    <div class="text-[10px] text-content-faint font-mono">配息</div>
                    <div class="font-mono text-[11px] text-accent">{{ latestCash(item).toFixed(2) }}</div>
                  </div>
                  <Chip :pt="{ root: { style: { color: fillChipColor(item), background: 'rgba(34,197,94,0.12)' } } }">{{ fillLabel(item) }}</Chip>
                  <Button
                    size="small"
                    text
                    class="!px-2 inline-flex items-center justify-center"
                    aria-label="移除自選"
                    @click.stop="removeItem(item)"
                  >
                    <ThemedIcon name="x-mark" size-class="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
      <Teleport to="body">
        <div
          v-if="showAdd"
          class="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/40"
        >
          <div class="absolute inset-0" @click="showAdd = false"></div>
          <div class="relative w-full max-w-md bg-surface-2 border border-border-strong rounded-[var(--radius)] shadow-xl p-5 space-y-4">
            <div class="font-mono text-sm font-semibold text-content">加入自選股</div>
            <div>
              <div class="text-[10px] font-mono text-content-faint uppercase mb-1">目標分組</div>
              <Select v-model="addTargetGroupId" :options="groupSelectOptions" option-label="label" option-value="value" />
            </div>
            <input
              v-model="addQuery"
              type="text"
              placeholder="輸入代號或名稱"
              class="w-full bg-surface-3 border border-border rounded-[var(--radius)] px-3 py-2 text-sm font-mono"
              @input="debouncedSearchAdd"
            />
            <div class="max-h-48 overflow-y-auto divide-y divide-border border border-border rounded-[var(--radius)]">
              <button
                v-for="s in addResults"
                :key="s.code"
                type="button"
                class="w-full text-left px-3 py-2 hover:bg-surface-3 flex justify-between font-mono text-[12px]"
                @click="addStock(s.code)"
              >
                <span class="text-accent">{{ s.code }}</span>
                <span class="text-content truncate ml-2">{{ s.name }}</span>
              </button>
              <div v-if="addQuery.trim() && !addResults.length" class="px-3 py-4 text-center text-content-faint text-xs">
                無結果
              </div>
            </div>
            <div class="flex justify-end gap-2">
              <Button severity="secondary" @click="showAdd = false">關閉</Button>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import Sortable from 'sortablejs'
import AppLayout from '@/components/layout/AppLayout.vue'
import Button from 'primevue/button'
import Chip from 'primevue/chip'
import Select from 'primevue/select'
import ThemedIcon from '@/components/icons/ThemedIcon.vue'
import { watchlistApi } from '@/services/api/watchlist'
import { stockApi } from '@/services/api/stock'
import type { WatchlistGroup, WatchlistItem } from '@/types'

const router = useRouter()

const groups = ref<WatchlistGroup[]>([])
const summary = ref<{
  totalStocks: number
  totalValue: number
  yearIncome: number
  pendingExDiv: number
} | null>(null)
const loading = ref<boolean>(true)
const activeGroupId = ref<string>('')
const showAdd = ref<boolean>(false)
const addQuery = ref<string>('')
const addResults = ref<{ code: string; name: string; sector: string }[]>([])
const addTargetGroupId = ref<string>('')
const searchQ = ref<string>('')
const sortableInstances: Sortable[] = []

let addSearchTimer: ReturnType<typeof setTimeout>

/**
 * 分組側欄按鈕樣式 class 陣列
 * @param g 分組
 * @returns class 名稱陣列
 */
const groupSidebarBtnClass = (g: WatchlistGroup): string[] => {
  const base =
    'flex items-center gap-2 w-full text-left px-2 py-2 rounded-[var(--radius)] text-[12px] transition-colors'
  return activeGroupId.value === g.id
    ? [base, 'bg-accent/15', 'text-accent']
    : [base, 'text-content-soft', 'hover:bg-surface-3']
}

/**
 * 卸載所有 Sortable 實例
 */
const tearDownSortables = (): void => {
  const copy = sortableInstances.splice(0, sortableInstances.length)
  copy.forEach((s) => s.destroy())
}

/**
 * 依目前分組綁定拖曳排序（SortableJS）
 */
const setupSortables = (): void => {
  tearDownSortables()
  for (const group of groups.value) {
    const el = document.getElementById(`wl-sort-${group.id}`)
    if (!el) continue
    const inst = Sortable.create(el, {
      animation: 150,
      handle: '.drag-handle',
      draggable: '.wl-sort-row',
      onEnd: (evt) => {
        const g = groups.value.find((x) => x.id === group.id)
        if (!g || evt.oldIndex === undefined || evt.newIndex === undefined || evt.oldIndex === evt.newIndex) return
        const next = [...g.items]
        const [moved] = next.splice(evt.oldIndex, 1)
        next.splice(evt.newIndex, 0, moved)
        g.items.splice(0, g.items.length, ...next)
        void persistReorder(g)
      },
    })
    sortableInstances.push(inst)
  }
}

const groupSelectOptions = computed(() =>
  groups.value.map((g) => ({ value: g.id, label: g.name })),
)

/**
 * 重新載入自選股與摘要
 */
const reloadAll = async (): Promise<void> => {
  const [wl, sm] = await Promise.all([watchlistApi.getAll(), watchlistApi.getSummary()])
  groups.value = wl.data
  summary.value = sm.data
  if (!activeGroupId.value && groups.value[0]) activeGroupId.value = groups.value[0].id
  if (!addTargetGroupId.value && groups.value[0]) addTargetGroupId.value = groups.value[0].id
}

/**
 * 於 DOM 更新後重建拖曳排序
 */
const refreshSortables = async (): Promise<void> => {
  await nextTick()
  setupSortables()
}

onMounted(async () => {
  try {
    await reloadAll()
  } catch {
    groups.value = []
  } finally {
    loading.value = false
  }
  await refreshSortables()
})

onBeforeUnmount(() => {
  tearDownSortables()
})

const formatMoney = (n: number): string =>
  n >= 1e8 ? `${(n / 1e8).toFixed(2)} 億` : `NT$ ${n.toLocaleString()}`

const goStock = (code: string): void => {
  void router.push(`/stock/${code}`)
}

const displayPrice = (item: WatchlistItem): number => item.stock.prices?.[0]?.close ?? 0

const priceChange = (item: WatchlistItem): number => {
  const a = item.stock.prices?.[0]?.close ?? 0
  const b = item.stock.prices?.[1]?.close ?? a
  if (b <= 0) return 0
  return parseFloat((((a - b) / b) * 100).toFixed(2))
}

/** 漲跌是否為上漲（避免模板內 `>=` 與 Rolldown 解析衝突） */
const isPriceUp = (item: WatchlistItem): boolean => priceChange(item) >= 0

const latestCash = (item: WatchlistItem): number => item.stock.dividends?.[0]?.cash ?? 0

const nextExLabel = (item: WatchlistItem): string => {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const future =
    item.stock.dividends
      ?.filter((x) => x.exDate && new Date(x.exDate) >= start)
      .sort((a, b) => new Date(a.exDate!).getTime() - new Date(b.exDate!).getTime()) ?? []
  const d = future[0]
  if (!d?.exDate) return ''
  return new Date(d.exDate).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' })
}

const fillLabel = (item: WatchlistItem): string => {
  const div = item.stock.dividends?.[0]
  if (div?.filled) return '已填息'
  if (div?.fillDays) return `填息 ≤${div.fillDays}d`
  return '填息中'
}

const fillChipColor = (item: WatchlistItem): string =>
  item.stock.dividends?.[0]?.filled ? '#22c55e' : '#94a3b8'

/**
 * 拖曳結束後同步排序至後端
 * @param group 分組
 */
const persistReorder = async (group: WatchlistGroup): Promise<void> => {
  const ids = group.items.map((i) => i.id)
  try {
    await watchlistApi.reorder(ids)
  } catch {
    await reloadAll()
  }
  await refreshSortables()
}

const removeItem = async (item: WatchlistItem): Promise<void> => {
  try {
    await watchlistApi.removeItem(item.id)
    await reloadAll()
    await refreshSortables()
  } catch {
    // ignore
  }
}

const promptNewGroup = async (): Promise<void> => {
  const name = window.prompt('新分組名稱')
  if (!name?.trim()) return
  try {
    await watchlistApi.createGroup(name.trim(), '#a855f7')
    await reloadAll()
    await refreshSortables()
  } catch {
    window.alert('建立失敗')
  }
}

const deleteGroupSafe = async (group: WatchlistGroup): Promise<void> => {
  if (!window.confirm(`確定刪除「${group.name}」？分組內須無股票。`)) return
  try {
    await watchlistApi.deleteGroup(group.id)
    await reloadAll()
    await refreshSortables()
  } catch (e: unknown) {
    const msg = e && typeof e === 'object' && 'response' in e
      ? String((e as { response?: { data?: { message?: string } } }).response?.data?.message ?? '')
      : ''
    window.alert(msg || '刪除失敗（請先移出股票）')
  }
}

const debouncedSearchAdd = (): void => {
  clearTimeout(addSearchTimer)
  addSearchTimer = setTimeout(() => void runAddSearch(), 280)
}

const runAddSearch = async (): Promise<void> => {
  const q = addQuery.value.trim()
  if (!q) {
    addResults.value = []
    return
  }
  try {
    const res = await stockApi.search(q, 12)
    addResults.value = res.data
  } catch {
    addResults.value = []
  }
}

const addStock = async (code: string): Promise<void> => {
  const gid = addTargetGroupId.value
  if (!gid) return
  try {
    await watchlistApi.addItem(gid, code)
    addQuery.value = ''
    addResults.value = []
    showAdd.value = false
    await reloadAll()
    await refreshSortables()
  } catch {
    window.alert('加入失敗（可能已在該分組）')
  }
}

const runSearch = async (): Promise<void> => {
  const q = searchQ.value.trim()
  if (!q) return
  try {
    const res = await stockApi.search(q, 1)
    if (res.data[0]) goStock(res.data[0].code)
  } catch {
    // ignore
  }
}

const openSearchHint = (): void => {
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }))
}
</script>