## Why

儀表板主圖目前顯示使用者自選股中的「Hero 個股」，但此選股邏輯模糊（取哪一檔？）且對首次使用者無意義；以加權指數（TAIEX）取而代之，可提供全市場脈絡，讓使用者在一眼中同時掌握大盤走勢與自己的持股組合。

## What Changes

- **移除** Dashboard 中的 hero stock 概念：不再呼叫 `stockApi.getFeatured()`，移除相關 state（`heroStock`、`heroPriceRequestToken`）
- **新增** 後端 API `GET /dashboard/taiex-series?range=6M`：從 TWSE 取得加權指數每日歷史資料，回傳 `OhlcvPoint[]`（使用收盤價填充 O/H/L/C）
- **更新** 前端 Dashboard 主圖：永遠顯示加權指數 K 線，標頭改為固定顯示「台灣加權指數 TAIEX」
- **更新** 標頭行情區：改為顯示 TAIEX 當日收盤點位、漲跌點數與漲跌幅（從 API 回傳的最新資料取得）
- **移除** 前端 hero stock 相關 template 分支（`v-if="heroStock"` / `v-else` placeholder）
- **移除** `extractYearsFromCandles`、`loadHeroPrices` 等 hero stock 專屬 functions（K 線 TWSE 休市標記邏輯保留，可從 taiex-series 回應取得）

## Capabilities

### New Capabilities

- `dashboard-taiex-series`: 後端 TAIEX 每日歷史序列 API，以 range 參數控制時間窗口，前端用來驅動儀表板主圖

### Modified Capabilities

- `dashboard-hero-quote-accuracy`: Hero 個股已從 Dashboard 移除，hero 報價精確度規格全面廢棄

## Impact

- `backend/src/dashboard/dashboard.controller.ts` — 新增 `GET taiex-series` 路由
- `backend/src/dashboard/dashboard.service.ts` — 新增 `getTaiexSeries(range)` method，呼叫 TWSE API
- `frontend/src/views/dashboard/Dashboard.vue` — 移除 hero stock 邏輯，改用 taiex-series API
- `frontend/src/services/api/dashboard.ts` — 新增 `getTaiexSeries(range)` API call
- `frontend/src/views/dashboard/Dashboard.spec.ts` — 更新 mock 與斷言
- 不影響後端 `StockService.getFeatured` API（其他頁面不使用）
