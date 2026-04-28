<template>
  <AppLayout :breadcrumbs="['持股管理']">
    <div class="p-6 max-w-[1200px] mx-auto space-y-6">
      <section class="bg-surface-2 border border-border rounded-[var(--radius)] p-5 space-y-4">
        <div class="font-mono text-xs uppercase tracking-widest text-content-faint">新增持股批次</div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            v-model="holdingForm.stockCode"
            type="text"
            class="px-3 py-2 bg-surface-3 border border-border rounded text-sm"
            placeholder="股票代號，例如 2330"
          />
          <input
            v-model="holdingForm.buyTimestamp"
            type="datetime-local"
            class="px-3 py-2 bg-surface-3 border border-border rounded text-sm"
          />
          <input
            v-model.number="holdingForm.buyPrice"
            type="number"
            min="0"
            step="0.01"
            class="px-3 py-2 bg-surface-3 border border-border rounded text-sm"
            placeholder="買入價格"
          />
          <input
            v-model.number="holdingForm.buyQuantity"
            type="number"
            min="1"
            step="1"
            class="px-3 py-2 bg-surface-3 border border-border rounded text-sm"
            placeholder="買入數量"
          />
        </div>
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="px-3 py-1.5 rounded bg-accent/20 text-accent font-mono text-xs"
            :disabled="holdingSubmitBusy"
            @click="submitHoldingLot"
          >
            {{ holdingSubmitBusy ? '送出中…' : '新增持股' }}
          </button>
          <button
            type="button"
            class="px-3 py-1.5 rounded bg-surface-3 text-content-soft font-mono text-xs"
            :disabled="holdingSubmitBusy"
            @click="loadHoldingLots"
          >
            重新整理
          </button>
          <span v-if="holdingSubmitError" class="font-mono text-xs text-down">{{ holdingSubmitError }}</span>
        </div>
      </section>

      <section class="bg-surface-2 border border-border rounded-[var(--radius)] p-5 space-y-3">
        <div class="flex items-center">
          <span class="font-mono text-xs uppercase tracking-widest text-content-faint">持股批次清單</span>
          <div class="flex-1" />
          <span class="font-mono text-xs text-content-faint">共 {{ holdingLots.length }} 筆</span>
        </div>
        <div v-if="holdingLots.length" class="space-y-1">
          <div
            v-for="lot in holdingLots"
            :key="lot.id"
            class="px-3 py-2 rounded bg-surface-3 text-[12px] font-mono grid grid-cols-4 gap-2"
          >
            <span class="text-content">{{ lot.stockCode }}</span>
            <span class="text-content-faint">{{ formatDateTime(lot.buyTimestamp) }}</span>
            <span class="text-content-faint">價格 {{ lot.buyPrice }}</span>
            <span class="text-content-faint">數量 {{ lot.buyQuantity }}</span>
          </div>
        </div>
        <div v-else class="text-content-faint text-xs font-mono py-6 text-center">尚無持股批次</div>
      </section>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import { stockApi } from '@/api/stock'
import type { HoldingLot } from '@/types'

const holdingLots = ref<HoldingLot[]>([])
const holdingSubmitError = ref<string | null>(null)
const holdingSubmitBusy = ref<boolean>(false)
const holdingForm = ref<{
  stockCode: string
  buyTimestamp: string
  buyPrice: number | null
  buyQuantity: number | null
}>({
  stockCode: '',
  buyTimestamp: '',
  buyPrice: null,
  buyQuantity: null,
})

/**
 * 將時間格式化為 zh-TW 顯示。
 * @param timestamp ISO 時間字串
 * @returns 顯示用日期時間
 */
const formatDateTime = (timestamp: string): string =>
  new Date(timestamp).toLocaleString('zh-TW')

/**
 * 重置持股輸入表單。
 * @returns void
 */
const resetHoldingForm = (): void => {
  holdingForm.value = {
    stockCode: '',
    buyTimestamp: '',
    buyPrice: null,
    buyQuantity: null,
  }
}

/**
 * 重抓持股批次列表。
 * @returns Promise<void>
 */
const loadHoldingLots = async (): Promise<void> => {
  const lotsRes = await stockApi.getHoldingLots()
  holdingLots.value = lotsRes.data
}

/**
 * 送出持股買入批次。
 * @returns Promise<void>
 */
const submitHoldingLot = async (): Promise<void> => {
  const stockCode = holdingForm.value.stockCode.trim().toUpperCase()
  const buyTimestamp = holdingForm.value.buyTimestamp
  const buyPrice = holdingForm.value.buyPrice
  const buyQuantity = holdingForm.value.buyQuantity
  if (!stockCode || !buyTimestamp || !buyPrice || !buyQuantity || buyPrice <= 0 || buyQuantity <= 0) {
    holdingSubmitError.value = '請完整填寫且買入價格、數量需大於 0'
    return
  }
  holdingSubmitBusy.value = true
  holdingSubmitError.value = null
  try {
    await stockApi.createHoldingLot({
      stockCode,
      buyTimestamp: new Date(buyTimestamp).toISOString(),
      buyPrice,
      buyQuantity,
    })
    await loadHoldingLots()
    resetHoldingForm()
  } catch {
    holdingSubmitError.value = '持股新增失敗，請稍後重試'
  } finally {
    holdingSubmitBusy.value = false
  }
}

onMounted(async () => {
  await loadHoldingLots()
})
</script>
