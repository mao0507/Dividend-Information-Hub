## Why

現有 `StockChart.vue` 以手寫 SVG 折線圖呈現收盤價，僅顯示單一維度資料，缺乏 OHLCV 燭台、成交量直方圖與原生互動（拖曳、縮放、游標工具列）。後端 `GET /stocks/:code/price` 已回傳完整 OHLCV 資料，改用 TradingView 官方開源函式庫 `lightweight-charts` 可零成本解鎖專業級 K 線體驗。

## What Changes

- 安裝 `lightweight-charts`（TradingView 官方 MIT 函式庫）至 `frontend/`
- 新增 `TvChart.vue` 元件：K 線燭台圖 + 成交量子圖，深色主題與應用設計系統對齊
- `StockDetailPage.vue`：以 `TvChart` 取代 `StockChart`，傳入完整 OHLCV 資料
- `DashboardPage.vue`：Hero 圖表以 `TvChart` 取代 `StockChart`，傳入 OHLCV 資料
- `frontend/src/types/index.ts`：新增 `OhlcvPoint` 型別
- 移除 `StockChart.vue` 對外 prop `series: number[]`（**BREAKING** — 替換後不再需要）

## Capabilities

### New Capabilities

- `tv-chart`: 以 `lightweight-charts` 渲染 TradingView 風格 K 線燭台圖 + 成交量子圖的 Vue 3 元件，支援時間範圍選擇、除息日標記、深色主題動態配色

### Modified Capabilities

- （無規格層級的行為變更，現有 API 合約不異動）

## Impact

- **前端套件**：新增 `lightweight-charts`（~100 KB gzip 後約 35 KB）
- **元件**：新增 `frontend/src/components/chart/TvChart.vue`；`StockChart.vue` 在兩頁面中被替換
- **型別**：`frontend/src/types/index.ts` 新增 `OhlcvPoint`
- **頁面**：`DashboardPage.vue`、`StockDetailPage.vue` 改用新元件與 OHLCV props
- **後端 API**：無異動（`GET /stocks/:code/price` 已回傳 OHLCV）
- **測試**：`StockChart.spec.ts` 對應更新為 `TvChart.spec.ts`
