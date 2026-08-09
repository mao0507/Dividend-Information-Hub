## Why

目前股票圖表區塊在部分情境下完全無法顯示，使用者進入儀表板與個股頁時只看到空白區域，導致技術分析與趨勢判讀流程中斷。此問題直接影響核心功能可用性，需優先修復。

## What Changes

- 新增圖表渲染前置檢查與錯誤可視化狀態，避免空白無回饋。
- 統一圖表資料轉換與初始化流程，確保資料晚到、空資料、異常資料都可被正確處理。
- 調整頁面端圖表掛載時機與重新渲染策略，避免容器尺寸或生命週期造成渲染失敗。
- 補上圖表元件測試案例，覆蓋成功渲染與失敗降級顯示。

## Capabilities

### New Capabilities
- `stock-chart-render-reliability`: 確保股票圖表在不同資料與掛載時機下都能穩定顯示，並在失敗時提供明確狀態。

### Modified Capabilities
- 無

## Impact

- 前端圖表元件與頁面整合邏輯（`frontend/src/components/chart`、`frontend/src/pages`）。
- 股價/技術線資料轉換流程（`frontend/src/api`、`frontend/src/types`）。
- 測試案例（`frontend/src/components/chart/*.spec.ts`）。
