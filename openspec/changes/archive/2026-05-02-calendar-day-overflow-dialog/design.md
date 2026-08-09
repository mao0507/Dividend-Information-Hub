## Context

`Calendar.vue` 的日期格以固定高度顯示除息事件列表。當同一天有 3 筆以上除息，後面的項目被截斷或隱藏。現有程式使用 `v-for` 無限列出，沒有溢出控制。

## Goals / Non-Goals

**Goals:**
- 每個日期格最多顯示 2 筆，超出顯示 `+N 更多` 按鈕
- 點擊按鈕彈出 PrimeVue Dialog，表格列出該日全部除息
- Dialog 欄位：代號、名稱、除息金額（0 顯示「尚未公布」）

**Non-Goals:**
- 不改 API 或後端邏輯
- 不改 Dashboard 的 7 日行事曆
- 不支援在 Dialog 內點擊跳頁（可後續加）

## Decisions

**D1: 溢出限制 = 2 筆**
日期格高度有限，2 筆 + `+N 更多` 剛好不超出格高。使用 `computed` 按日期分組，`slice(0, 2)` 取前 2 筆。

**D2: 使用 PrimeVue Dialog**
專案已安裝 PrimeVue，直接用 `<Dialog>` 元件，不引入額外依賴。

**D3: 溢出事件 state 設計**
`overflowDialogDate = ref<string | null>(null)`：記錄當前開啟 Dialog 的日期 key（`YYYY-MM-DD`）。Dialog 的事件清單由 `computed` 從 `eventsByDate[overflowDialogDate.value]` 取得。

**D4: 表格實作**
使用原生 `<table>` + Tailwind styling，不用 PrimeVue DataTable，避免引入額外樣式衝突。

## Risks / Trade-offs

- [格高] 不同螢幕尺寸格子可能只能容納 1 筆 → 限制 2 筆是安全值，可後續依格高動態計算
- [PrimeVue Dialog z-index] 可能與 topbar 衝突 → 用 `:pt` 或 `:style` 調整
