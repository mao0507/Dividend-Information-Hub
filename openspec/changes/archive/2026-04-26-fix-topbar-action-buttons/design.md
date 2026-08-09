## Context

`AppTopbar` 右上角目前渲染三個 icon 按鈕，但未綁定任何點擊行為，導致操作無作用。這些按鈕位於全域版面且高頻可見，若無功能會持續產生錯誤心智模型。此變更僅涉及前端 UI 與路由導流，不涉及後端 schema 變更。

## Goals / Non-Goals

**Goals:**
- 讓三個 Topbar 按鈕具備明確且一致的行為。
- 按鈕行為可由測試驗證（可定位、可點擊、導向正確）。
- 不破壞既有 breadcrumb、時間顯示與版面結構。

**Non-Goals:**
- 不在本次變更新增完整資料匯出流程後端。
- 不重做 Topbar 視覺設計與資訊架構。
- 不導入新的 UI 套件。

## Decisions

1. **圖示改為語意化 action config**
   - 以陣列定義 `{ icon, label, to }`，避免硬編碼 icon list。
   - 好處：易於擴充、可讀性高、測試可直接依 label 定位。

2. **按鈕行為優先使用路由導流**
   - `↓`（下載）→ `/settings` 的資料匯出區塊（先提供可用入口）
   - `⌁`（提醒）→ `/alerts`
   - `⚙`（設定）→ `/settings`
   - 理由：先解決「無作用」問題，並避免引入新後端依賴。

3. **加入無障礙與可測試標記**
   - 每個按鈕提供 `aria-label` 或可見文字語義。
   - 理由：提高可及性並提升 E2E/單測穩定性。

## Risks / Trade-offs

- **[Risk] 下載按鈕導向 `/settings` 可能與使用者預期不完全一致** → 在 label/tooltip 清楚標示「前往匯出設定」。
- **[Risk] 直接導流可能與未來功能實作重複** → 使用 action config，未來可無痛改成觸發 modal/API。
- **[Risk] 測試依賴 icon 文案易脆弱** → 優先以 aria-label 驗證，避免純 icon selector。

## Migration Plan

1. 調整 `AppTopbar.vue` 按鈕資料結構與點擊處理。
2. 補 `router.push` 或 `RouterLink` 行為。
3. 新增/更新測試覆蓋三個 action。
4. 手動驗證全站頁面的 Topbar 行為是否一致。

## Open Questions

- 下載按鈕未來是否要改為直接下載（CSV/JSON）而非導流設定頁？
- 是否需要在行動版隱藏部分 action（目前專案尚未定義 Topbar 響應式規範）？
