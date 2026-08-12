<template>
  <AppLayout :breadcrumbs="['持股管理']">
    <div class="p-6 max-w-[1200px] mx-auto space-y-6">

      <!-- 新增持股批次表單 -->
      <section class="bg-surface-2 border border-border rounded-[var(--radius)] p-5 space-y-4">
        <h2 class="font-mono text-xs uppercase tracking-widest text-content-faint">新增持股批次</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="space-y-1">
            <label for="lot-stock-code" class="font-mono text-[11px] text-content-faint">股票代號</label>
            <input
              id="lot-stock-code"
              v-model="form.stockCode"
              type="text"
              class="w-full px-3 py-2 bg-surface-3 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
              placeholder="例如 2330"
            />
          </div>
          <div class="space-y-1">
            <label for="lot-buy-timestamp" class="font-mono text-[11px] text-content-faint">買入時間</label>
            <input
              id="lot-buy-timestamp"
              v-model="form.buyTimestamp"
              type="datetime-local"
              class="w-full px-3 py-2 bg-surface-3 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
            />
          </div>
          <div class="space-y-1">
            <label for="lot-buy-price" class="font-mono text-[11px] text-content-faint">買入價格</label>
            <input
              id="lot-buy-price"
              v-model.number="form.buyPrice"
              type="number"
              min="0"
              step="0.01"
              class="w-full px-3 py-2 bg-surface-3 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
              placeholder="每股價格"
            />
          </div>
          <div class="space-y-1">
            <label for="lot-buy-quantity" class="font-mono text-[11px] text-content-faint">買入數量（股）</label>
            <input
              id="lot-buy-quantity"
              v-model.number="form.buyQuantity"
              type="number"
              min="1"
              step="1"
              class="w-full px-3 py-2 bg-surface-3 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
              placeholder="股數"
            />
          </div>
        </div>
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="px-4 py-2 rounded-[var(--radius)] bg-accent text-surface font-semibold font-mono text-xs hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-40 disabled:cursor-not-allowed"
            :disabled="submitBusy"
            @click="submitLot"
          >
            {{ submitBusy ? '送出中…' : '新增持股' }}
          </button>
          <span v-if="submitError" role="alert" class="font-mono text-xs text-down">{{ submitError }}</span>
        </div>
      </section>

      <!-- 持股彙總列表 -->
      <section class="bg-surface-2 border border-border rounded-[var(--radius)] p-5 space-y-3">
        <div class="flex items-center">
          <h2 class="font-mono text-xs uppercase tracking-widest text-content-faint">持股彙總</h2>
          <div class="flex-1" />
          <span class="font-mono text-xs text-content-faint">共 {{ holdings.length }} 檔</span>
        </div>

        <!-- 投資組合未實現損益總計 -->
        <div
          v-if="pnl"
          class="flex flex-wrap items-center gap-x-6 gap-y-1 px-4 py-3 bg-surface-3 rounded-[var(--radius)] font-mono text-xs"
        >
          <span class="text-content-faint">未實現損益</span>
          <span :class="pnl.total.totalUnrealizedGain >= 0 ? 'text-up' : 'text-down'">
            {{ formatCurrency(pnl.total.totalUnrealizedGain) }}
            ({{ pnl.total.totalUnrealizedGainPct >= 0 ? '+' : '' }}{{ pnl.total.totalUnrealizedGainPct.toFixed(2) }}%)
          </span>
          <span v-if="pnlHasUnpriced" class="text-content-faint">部分持股無最新股價，未計入損益總計</span>
        </div>

        <div v-if="holdings.length" class="space-y-2">
          <div
            v-for="h in holdings"
            :key="h.id"
            class="border border-border rounded-[var(--radius)] overflow-hidden"
          >
            <!-- 彙總列 -->
            <button
              type="button"
              class="w-full px-4 py-3 bg-surface-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-left hover:bg-surface-3/80 transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-inset"
              :aria-expanded="expanded.has(h.stockCode)"
              :aria-controls="`lot-detail-${h.stockCode}`"
              @click="toggleExpand(h.stockCode)"
            >
              <span class="font-mono text-sm text-accent w-16 shrink-0">{{ h.stockCode }}</span>
              <span class="text-sm text-content truncate flex-1 min-w-[80px]">{{ h.stockName }}</span>
              <span class="font-mono text-xs text-content-faint">{{ h.shares.toLocaleString() }} 股</span>
              <span class="font-mono text-xs text-content-faint">均價 {{ h.avgCost.toFixed(2) }}</span>
              <span class="font-mono text-xs text-up">已獲股息 {{ formatCurrency(h.earnedDividend) }}</span>
              <span v-if="pnlByStock[h.stockCode]" class="font-mono text-xs" :class="pnlRowClass(h.stockCode)">
                損益 {{ pnlRowText(h.stockCode) }}
              </span>
              <span aria-hidden="true" class="font-mono text-xs text-content-faint ml-2">{{ expanded.has(h.stockCode) ? '▲' : '▼' }}</span>
            </button>

            <!-- 展開明細 -->
            <div v-if="expanded.has(h.stockCode)" :id="`lot-detail-${h.stockCode}`" class="divide-y divide-border">
              <div
                v-for="lot in h.lots"
                :key="lot.id"
                class="px-4 py-2 bg-surface-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] font-mono"
              >
                <span class="text-content-faint w-36 shrink-0">{{ formatDateTime(lot.buyTimestamp) }}</span>
                <span class="text-content-faint">價 {{ lot.buyPrice.toFixed(2) }}</span>
                <span class="text-content-faint">× {{ lot.buyQuantity.toLocaleString() }} 股</span>
                <span class="text-content-faint">成本 {{ formatCurrency(lot.buyPrice * lot.buyQuantity) }}</span>
                <div class="flex-1" />
                <button
                  type="button"
                  class="px-3 py-1.5 rounded bg-danger/10 text-danger text-[11px] hover:bg-danger/20 transition-colors focus:outline-none focus:ring-2 focus:ring-danger disabled:opacity-40"
                  :disabled="deletingLotId === lot.id"
                  :aria-label="`刪除 ${formatDateTime(lot.buyTimestamp)} 買入的批次`"
                  @click.stop="confirmDeleteLot(h, lot)"
                >
                  {{ deletingLotId === lot.id ? '刪除中…' : '刪除' }}
                </button>
              </div>
              <p v-if="deleteError && deleteErrorLotId && h.lots.some((l) => l.id === deleteErrorLotId)" role="alert" class="px-4 py-2 font-mono text-[11px] text-down bg-surface-2">
                {{ deleteError }}
              </p>
            </div>
          </div>
        </div>

        <div v-else class="text-content-faint text-xs font-mono py-6 text-center">尚無持股記錄</div>
      </section>

      <!-- 投資比重 -->
      <section
        v-if="allocation.length"
        class="bg-surface-2 border border-border rounded-[var(--radius)] p-5 space-y-4"
      >
        <div class="flex items-center justify-between">
          <h2 class="font-mono text-xs uppercase tracking-widest text-content-faint">投資比重</h2>
          <span class="font-mono text-xs text-content-faint">總投入 {{ formatCurrency(totalCost) }}</span>
        </div>

        <!-- 多檔：顯示圓餅圖 -->
        <DonutChart v-if="allocation.length > 1" :segments="donutSegments" />

        <!-- 單檔：純數字 -->
        <div v-else class="flex items-center gap-4 px-2">
          <span class="font-mono text-sm text-accent">{{ allocation[0].stockCode }}</span>
          <span class="text-sm text-content">{{ allocation[0].name }}</span>
          <span class="font-mono text-sm text-content ml-auto">{{ formatCurrency(allocation[0].totalCost) }}</span>
          <span class="font-mono text-xs text-content-faint">100%</span>
        </div>
      </section>

    </div>

    <!-- 刪除批次確認 Dialog -->
    <Dialog
      v-model:visible="deleteDialogVisible"
      header="確認刪除批次"
      modal
      :style="{ width: '360px' }"
    >
      <p class="text-sm text-content mb-1">
        確定要刪除這筆買入批次嗎？
      </p>
      <p v-if="deleteTargetIsLastLot" class="font-mono text-xs text-down">
        這是「{{ deleteTargetStockCode }}」僅剩的批次，刪除後該持股會從清單中完全移除。
      </p>
      <p class="font-mono text-[11px] text-content-faint mt-2">此操作無法復原。</p>
      <template #footer>
        <button
          type="button"
          class="px-3 py-1.5 rounded bg-surface-2 border border-border-strong text-content-soft text-xs font-mono hover:text-content transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
          @click="deleteDialogVisible = false"
        >
          取消
        </button>
        <button
          type="button"
          class="px-3 py-1.5 rounded bg-danger text-surface font-semibold text-xs font-mono hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-danger"
          @click="performDelete"
        >
          確定刪除
        </button>
      </template>
    </Dialog>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import Dialog from 'primevue/dialog'
import AppLayout from '@/components/layout/AppLayout.vue'
import DonutChart from '@/components/chart/DonutChart.vue'
import {
  holdingsApi,
  type AllocationItem,
  type HoldingLotItem,
  type HoldingWithLots,
  type PnlResult,
} from '@/services/api/holdings'

const holdings = ref<HoldingWithLots[]>([])
const allocation = ref<AllocationItem[]>([])
const pnl = ref<PnlResult | null>(null)
const expanded = ref<Set<string>>(new Set())
const submitBusy = ref<boolean>(false)
const submitError = ref<string | null>(null)
const deletingLotId = ref<string | null>(null)
const deleteError = ref<string | null>(null)
const deleteErrorLotId = ref<string | null>(null)

const deleteDialogVisible = ref<boolean>(false)
const deleteTargetHolding = ref<HoldingWithLots | null>(null)
const deleteTargetLot = ref<HoldingLotItem | null>(null)

const form = ref<{
  stockCode: string
  buyTimestamp: string
  buyPrice: number | null
  buyQuantity: number | null
}>({ stockCode: '', buyTimestamp: '', buyPrice: null, buyQuantity: null })

/**
 * 是否所有損益資料中至少一檔缺最新股價（未計入總計）。
 * @returns 是否有無股價的持股
 */
const pnlHasUnpriced = computed<boolean>(() =>
  (pnl.value?.holdings ?? []).some((h) => h.priceUnavailableReason !== null),
)

/**
 * 依股票代號索引損益資料，方便彙總列查表。
 * @returns stockCode -> 損益項目
 */
const pnlByStock = computed<Record<string, PnlResult['holdings'][number]>>(() =>
  Object.fromEntries((pnl.value?.holdings ?? []).map((h) => [h.stockCode, h])),
)

/**
 * 該股損益顯示文字；無股價時顯示原因而非數字。
 * @param stockCode 股票代號
 * @returns 顯示文字
 */
const pnlRowText = (stockCode: string): string => {
  const row = pnlByStock.value[stockCode]
  if (!row) return ''
  if (row.priceUnavailableReason || row.unrealizedGain === null || row.unrealizedGainPct === null) {
    return '無最新股價'
  }
  return `${formatCurrency(row.unrealizedGain)} (${row.unrealizedGainPct >= 0 ? '+' : ''}${row.unrealizedGainPct.toFixed(2)}%)`
}

/**
 * 該股損益文字色（漲紅跌綠，無資料則用弱化文字色）。
 * @param stockCode 股票代號
 * @returns Tailwind class
 */
const pnlRowClass = (stockCode: string): string => {
  const row = pnlByStock.value[stockCode]
  if (!row || row.unrealizedGain === null) return 'text-content-faint'
  return row.unrealizedGain >= 0 ? 'text-up' : 'text-down'
}

/**
 * 計算所有持股的總投入金額。
 * @returns 總投入金額
 */
const totalCost = computed<number>(() =>
  allocation.value.reduce((s, item) => s + item.totalCost, 0),
)

/**
 * 轉換投資比重為圓餅圖 segment 格式。
 * @returns DonutChart segments
 */
const donutSegments = computed(() => {
  const total = totalCost.value
  if (total === 0) return []
  return allocation.value.map((item) => ({
    label: `${item.stockCode} ${item.name}`,
    pct: (item.totalCost / total) * 100,
    value: item.totalCost,
  }))
})

/**
 * 格式化時間為 zh-TW 顯示字串。
 * @param timestamp ISO 時間字串
 * @returns 顯示用日期時間
 */
const formatDateTime = (timestamp: string): string =>
  new Date(timestamp).toLocaleString('zh-TW')

/**
 * 格式化金額為台幣顯示。
 * @param value 數值
 * @returns 顯示用金額字串
 */
const formatCurrency = (value: number): string =>
  value.toLocaleString('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 })

/**
 * 切換指定股票的批次明細展開狀態。
 * @param stockCode 股票代號
 */
const toggleExpand = (stockCode: string): void => {
  const next = new Set(expanded.value)
  next.has(stockCode) ? next.delete(stockCode) : next.add(stockCode)
  expanded.value = next
}

/**
 * 重新載入持股、比重、損益資料。
 * @returns Promise<void>
 */
const loadData = async (): Promise<void> => {
  const [holdingsRes, allocationRes, pnlRes] = await Promise.all([
    holdingsApi.getHoldings(),
    holdingsApi.getAllocation(),
    holdingsApi.getPnl(),
  ])
  holdings.value = holdingsRes.data
  allocation.value = allocationRes.data
  pnl.value = pnlRes.data
}

/**
 * 重置輸入表單。
 * @returns void
 */
const resetForm = (): void => {
  form.value = { stockCode: '', buyTimestamp: '', buyPrice: null, buyQuantity: null }
}

/**
 * 送出買入批次。
 * @returns Promise<void>
 */
const submitLot = async (): Promise<void> => {
  const stockCode = form.value.stockCode.trim().toUpperCase()
  const { buyTimestamp, buyPrice, buyQuantity } = form.value
  if (!stockCode || !buyTimestamp || !buyPrice || !buyQuantity || buyPrice <= 0 || buyQuantity <= 0) {
    submitError.value = '請完整填寫，且買入價格、數量需大於 0'
    return
  }
  submitBusy.value = true
  submitError.value = null
  try {
    await holdingsApi.createLot({
      stockCode,
      buyTimestamp: new Date(buyTimestamp).toISOString(),
      buyPrice,
      buyQuantity,
    })
    await loadData()
    resetForm()
  } catch {
    submitError.value = '持股新增失敗，請稍後重試'
  } finally {
    submitBusy.value = false
  }
}

/** 待刪除批次是否為該持股僅剩的一筆 */
const deleteTargetIsLastLot = computed<boolean>(() =>
  deleteTargetHolding.value?.lots.length === 1,
)
const deleteTargetStockCode = computed<string>(() => deleteTargetHolding.value?.stockCode ?? '')

/**
 * 開啟刪除批次確認對話框。
 * @param holding 該批次所屬持股
 * @param lot 待刪除批次
 */
const confirmDeleteLot = (holding: HoldingWithLots, lot: HoldingLotItem): void => {
  deleteTargetHolding.value = holding
  deleteTargetLot.value = lot
  deleteDialogVisible.value = true
}

/**
 * 使用者確認後實際執行刪除。
 * @returns Promise<void>
 */
const performDelete = async (): Promise<void> => {
  const lot = deleteTargetLot.value
  if (!lot) return
  deleteDialogVisible.value = false
  deletingLotId.value = lot.id
  deleteError.value = null
  deleteErrorLotId.value = null
  try {
    await holdingsApi.deleteLot(lot.id)
    await loadData()
  } catch {
    deleteError.value = '刪除失敗，請稍後重試'
    deleteErrorLotId.value = lot.id
  } finally {
    deletingLotId.value = null
  }
}

onMounted(loadData)
</script>
