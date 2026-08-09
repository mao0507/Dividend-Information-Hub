## Why

Dashboard 的「累積股息收入」目前在資料缺漏、欄位語意不一致或時間區間切換時容易出現不可信任的顯示，使用者無法判斷數值是否可用。近期已補強多項 Dashboard 資料來源，現在需要把此指標的契約與顯示邏輯一起補齊，避免決策誤判。

## What Changes

- 釐清「累積股息收入」的資料定義，限定為已確認入帳且在可追蹤期間內的股息總和。
- 新增 Dashboard 對「累積股息收入」的完整狀態處理：`ready`、`empty`、`stale`、`error`，缺值時顯示中性值而非 `0`。
- 統一該指標與 Dashboard 其餘卡片的 `asOf` 時間基準，避免同頁出現不同批次資料時間。
- 明確定義當 API 回傳缺欄位或回傳格式異常時的降級策略與前端顯示文案。

## Capabilities

### New Capabilities
- `dashboard-cumulative-dividend-income`: 定義 Dashboard 累積股息收入卡片的資料契約、計算範圍與狀態降級規則

### Modified Capabilities
- `dashboard-top-summary-cards`: 既有四卡資料契約擴充為可表達「累積股息收入」的可用性與時間一致性要求

## Impact

- 前端：`frontend/src/pages/DashboardPage.vue`、Dashboard 卡片資料轉換工具、型別定義與單元測試
- 後端：Dashboard 彙總 API 回傳欄位與型別驗證（如需要補齊 `asOf` 與狀態欄位）
- 規格：新增 `dashboard-cumulative-dividend-income` 能力規格，並更新 `dashboard-top-summary-cards` delta spec
