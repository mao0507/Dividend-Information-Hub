## Why

Dashboard 上方四個統計區塊目前資訊不一致、語意不清，且在資料缺漏時容易顯示誤導數值，影響使用者對整體盤勢與個人追蹤狀態的第一眼判讀。現在需要先把四個區塊的定義、資料來源與缺值行為收斂，避免錯誤決策。

## What Changes

- 統一四個統計區塊的資料定義與計算規則，避免不同區塊混用不同時間基準。
- 明確定義每個區塊在「無資料、部分資料、同步失敗」時的顯示文案與 fallback 值。
- 調整四個區塊的更新時機，確保頁面初載與手動刷新後一致。
- 新增可測試的資料轉換層，將區塊顯示邏輯與 API 回應解耦。
- 補上四個區塊的單元測試與頁面層驗證場景，覆蓋正常與異常資料。

## Capabilities

### New Capabilities
- `dashboard-top-summary-cards`: 定義 Dashboard 上方四個統計區塊的資料契約、缺值處理與顯示一致性規則。

### Modified Capabilities
- `dashboard-hero-quote-accuracy`: 既有 hero 報價正確性需求擴充為「與四個統計區塊共享同一時間基準與資料新鮮度判斷」。

## Impact

- Affected code:
  - `frontend/src/pages/DashboardPage.vue`
  - `frontend/src/types/index.ts`
  - `frontend/src/api/*`（若需補齊四區塊資料欄位）
  - `frontend/src/utils/*`（新增或調整統計卡片資料轉換）
- Affected tests:
  - `frontend/src/pages/*.spec.ts`
  - `frontend/src/utils/*.spec.ts`
- API / data:
  - 可能需要補齊 Dashboard 聚合欄位或前端對既有欄位做一致映射
- Dependencies:
  - 無新增第三方套件（預設）
