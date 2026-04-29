<template>
  <AppLayout :breadcrumbs="['持股管理']">
    <div class="p-6 max-w-[1200px] mx-auto space-y-6">

      <!-- 新增持股批次表單 -->
      <section class="bg-surface-2 border border-border rounded-[var(--radius)] p-5 space-y-4">
        <div class="font-mono text-xs uppercase tracking-widest text-content-faint">新增持股批次</div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            v-model="form.stockCode"
            type="text"
            class="px-3 py-2 bg-surface-3 border border-border rounded text-sm"
            placeholder="股票代號，例如 2330"
          />
          <input
            v-model="form.buyTimestamp"
            type="datetime-local"
            class="px-3 py-2 bg-surface-3 border border-border rounded text-sm"
          />
          <input
            v-model.number="form.buyPrice"
            type="number"
            min="0"
            step="0.01"
            class="px-3 py-2 bg-surface-3 border border-border rounded text-sm"
            placeholder="買入價格"
          />
          <input
            v-model.number="form.buyQuantity"
            type="number"
            min="1"
            step="1"
            class="px-3 py-2 bg-surface-3 border border-border rounded text-sm"
            placeholder="買入數量（股）"
          />
        </div>
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="px-3 py-1.5 rounded bg-accent/20 text-accent font-mono text-xs"
            :disabled="submitBusy"
            @click="submitLot"
          >
            {{ submitBusy ? '送出中…' : '新增持股' }}
          </button>
          <span v-if="submitError" class="font-mono text-xs text-down">{{ submitError }}</span>
        </div>
      </section>

      <!-- 持股彙總列表 -->
      <section class="bg-surface-2 border border-border rounded-[var(--radius)] p-5 space-y-3">
        <div class="flex items-center">
          <span class="font-mono text-xs uppercase tracking-widest text-content-faint">持股彙總</span>
          <div class="flex-1" />
          <span class="font-mono text-xs text-content-faint">共 {{ holdings.length }} 檔</span>
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
              class="w-full px-4 py-3 bg-surface-3 flex items-center gap-4 text-left hover:bg-surface-3/80 transition-colors"
              @click="toggleExpand(h.stockCode)"
            >
              <span class="font-mono text-sm text-accent w-16 shrink-0">{{ h.stockCode }}</span>
              <span class="text-sm text-content truncate flex-1">{{ h.stockName }}</span>
              <span class="font-mono text-xs text-content-faint">{{ h.shares.toLocaleString() }} 股</span>
              <span class="font-mono text-xs text-content-faint">均價 {{ h.avgCost.toFixed(2) }}</span>
              <span class="font-mono text-xs text-up">已獲股息 {{ formatCurrency(h.earnedDividend) }}</span>
              <span class="font-mono text-xs text-content-faint ml-2">{{ expanded.has(h.stockCode) ? '▲' : '▼' }}</span>
            </button>

            <!-- 展開明細 -->
            <div v-if="expanded.has(h.stockCode)" class="divide-y divide-border">
              <div
                v-for="lot in h.lots"
                :key="lot.id"
                class="px-4 py-2 bg-surface-2 flex items-center gap-4 text-[12px] font-mono"
              >
                <span class="text-content-faint w-36 shrink-0">{{ formatDateTime(lot.buyTimestamp) }}</span>
                <span class="text-content-faint">價 {{ lot.buyPrice.toFixed(2) }}</span>
                <span class="text-content-faint">× {{ lot.buyQuantity.toLocaleString() }} 股</span>
                <span class="text-content-faint">成本 {{ formatCurrency(lot.buyPrice * lot.buyQuantity) }}</span>
                <div class="flex-1" />
                <button
                  type="button"
                  class="px-2 py-0.5 rounded bg-down/10 text-down text-[11px]"
                  :disabled="deletingLotId === lot.id"
                  @click.stop="deleteLot(lot.id)"
                >
                  {{ deletingLotId === lot.id ? '刪除中…' : '刪除' }}
                </button>
              </div>
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
          <span class="font-mono text-xs uppercase tracking-widest text-content-faint">投資比重</span>
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
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import DonutChart from '@/components/chart/DonutChart.vue'
import { holdingsApi, type AllocationItem, type HoldingWithLots } from '@/services/api/holdings'

const holdings = ref<HoldingWithLots[]>([])
const allocation = ref<AllocationItem[]>([])
const expanded = ref<Set<string>>(new Set())
const submitBusy = ref<boolean>(false)
const submitError = ref<string | null>(null)
const deletingLotId = ref<string | null>(null)

const form = ref<{
  stockCode: string
  buyTimestamp: string
  buyPrice: number | null
  buyQuantity: number | null
}>({ stockCode: '', buyTimestamp: '', buyPrice: null, buyQuantity: null })

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
 * 重新載入持股與比重資料。
 * @returns Promise<void>
 */
const loadData = async (): Promise<void> => {
  const [holdingsRes, allocationRes] = await Promise.all([
    holdingsApi.getHoldings(),
    holdingsApi.getAllocation(),
  ])
  holdings.value = holdingsRes.data
  allocation.value = allocationRes.data
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

/**
 * 刪除指定買入批次。
 * @param lotId 批次 ID
 * @returns Promise<void>
 */
const deleteLot = async (lotId: string): Promise<void> => {
  deletingLotId.value = lotId
  try {
    await holdingsApi.deleteLot(lotId)
    await loadData()
  } catch {
    // 靜默失敗：batch 仍在清單，使用者可重試
  } finally {
    deletingLotId.value = null
  }
}

onMounted(loadData)
</script>
