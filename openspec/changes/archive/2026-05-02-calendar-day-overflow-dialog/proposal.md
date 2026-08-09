## Why

行事曆格子空間有限，單日多筆除息時後面的股票被截斷、無法顯示。使用者看不到同一天所有除息股票。

## What Changes

- 每個日期格最多顯示 2 筆除息事件
- 超出 2 筆時，顯示 `+N 更多` 按鈕
- 點擊 `+N 更多` 彈出 Dialog
- Dialog 以表格列出該日所有除息股票：代號、名稱、除息金額
- 除息金額為 0（尚未公布）時顯示「尚未公布」

## Capabilities

### New Capabilities

- `calendar-day-overflow-dialog`: 行事曆日期格溢出時以 Dialog 展示該日完整除息清單

### Modified Capabilities

（無）

## Impact

- `frontend/src/views/calendar/Calendar.vue`：加入溢出偵測、+N 按鈕、Dialog 元件
- 使用 PrimeVue `Dialog` 元件（已安裝）
- 無 API / 後端變更
