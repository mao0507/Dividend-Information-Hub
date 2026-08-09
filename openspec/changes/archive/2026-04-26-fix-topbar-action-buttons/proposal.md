## Why

目前右上角三個操作按鈕（下載、提醒、設定）只有圖示，沒有任何行為，造成使用者點擊後無回饋，屬於明顯可用性缺陷。需要補上可預期的互動結果，讓 Topbar 真正成為可操作入口而不是靜態展示。

## What Changes

- 為 Topbar 右上角三個按鈕定義與實作明確行為：
  - 下載：導向資料匯出區塊（或觸發匯出流程）
  - 提醒：導向提醒中心頁
  - 設定：導向設定頁
- 為按鈕補上可測試的語意標記（可辨識名稱/aria label）。
- 補上最小測試驗收，確保按鈕點擊會觸發對應路由或動作。

## Capabilities

### New Capabilities
- `topbar-action-buttons`: 提供 Topbar 操作按鈕的可用互動能力與一致導流行為。

### Modified Capabilities
- 無

## Impact

- 影響檔案：
  - `frontend/src/components/layout/AppTopbar.vue`
  - 可能包含 router 相關測試檔
- 影響範圍：前端導覽與可用性。
- 相依：無新增外部依賴。
