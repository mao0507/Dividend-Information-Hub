## Why

`Ranking` 頁目前在資料載入失敗或回傳空集合時沒有清楚的空狀態，使用者只看到空白區塊。另有「從其他頁返回時畫面變黑」問題，代表頁面切換生命週期或錯誤處理存在缺陷，需優先修正以恢復基本可用性。

## What Changes

- 修正 Ranking 頁在「無資料 / 載入失敗」時的顯示與回復行為，提供明確空狀態與重試入口。
- 修正返回上一頁黑屏問題，確保頁面切換後主內容可正常渲染。
- 補上路由切換與 Ranking 空資料情境的驗收與測試保護。
- 統一這兩類問題的錯誤回饋策略，避免靜默失敗導致「看起來像黑屏」。

## Capabilities

### New Capabilities
- `ranking-resilience`: 提供 Ranking 頁在空資料、錯誤、回頁切換時的穩定渲染與可恢復行為。

### Modified Capabilities
- 無

## Impact

- 影響檔案（預期）：
  - `frontend/src/pages/RankingPage.vue`
  - `frontend/src/components/layout/AppLayout.vue` / `AppTopbar.vue`（若黑屏與 layout 狀態有關）
  - `frontend/src/router/index.ts`（若返回黑屏與 guard 流程有關）
- 測試影響：需新增 Ranking 空資料與返回頁渲染測試（unit/e2e）。
- 外部依賴：無新增第三方套件需求。
