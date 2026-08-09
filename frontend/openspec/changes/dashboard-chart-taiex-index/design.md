## Context

Dashboard 主圖目前以 `stockApi.getFeatured()` 取得自選股中特定個股，再呼叫 `stockApi.getPriceSeries(code, range)` 取得 K 線資料。TAIEX 加權指數並非一般股票，資料庫中無對應 stock 代號與歷史 K 線，因此需要獨立的資料來源與後端 API。

TWSE 提供 `MI_5MINS_HIST` API，以月份為單位回傳加權指數每個交易日的 OHLC 數據，一次呼叫可取得整月資料（約 20~23 筆）。6M 範圍只需 6~7 次 API 呼叫，對 TWSE rate limit 影響極小。

## Goals / Non-Goals

**Goals:**
- 儀表板主圖永遠顯示 TAIEX 加權指數 K 線
- 標頭行情顯示最新收盤點位、漲跌點數與漲跌幅（從 API 回傳最新一筆取得）
- 後端提供 `GET /dashboard/taiex-series?range=6M` 端點，回傳 `OhlcvPoint[]`
- 移除 hero stock 概念（不再呼叫 `getFeatured`、不再有 `heroStock` state）

**Non-Goals:**
- 不做 TAIEX 資料的 DB 持久化（採即時向 TWSE 取得，後端記憶體快取 60 分鐘）
- 不改動 `StockService.getFeatured` 後端實作
- 不在 `TvChart` 顯示真實 OHLC 分時資料（以 close-only 線圖呈現即可）

## Decisions

**TWSE MI_5MINS_HIST 作為資料來源**
`https://www.twse.com.tw/rwd/zh/TAIEX/MI_5MINS_HIST?date=YYYYMMDD&response=json` 以月份為查詢單位（date 參數中任意一天代表該月），回傳所有交易日的 O/H/L/C 加權指數資料。此 API 免認證，後端可直接呼叫，無需透過已部署的 Cloudflare proxy。

**後端快取策略：記憶體快取 60 分鐘**
採 Map 或 `@nestjs/cache-manager` 對每個 `month` 的 TWSE 回應快取 60 分鐘，避免同一請求時段多次打 TWSE。快取 key 為 `taiex:YYYYMM`。

**以 close 填充 OHLCV**
`TvChart` 接受 `OhlcvPoint[]`（含 O/H/L/C）。TAIEX MI_5MINS_HIST 提供真實 OHLC，直接使用；若取不到真實值，fallback 以 close 填充其他欄位。

**前端移除所有 heroStock 邏輯**
`heroStock`、`heroPriceRequestToken`、`loadHeroPrices`、`extractYearsFromCandles` 全數刪除；替換為 `loadTaiexSeries()` + 對應 `taiexCandles` ref。

**TWSE 休市標記（twseClosedDates）保留**
`TvChart` 使用 `twseClosedDates` 過濾非交易日空白；改為從 `taiex-series` API 的 `closedDates` 欄位取得（後端推導），或保留前端現有的 `getTwseClosedDates` 呼叫邏輯。

## Risks / Trade-offs

- [風險] TWSE API 格式變更 → 緩解：在後端 parse 層加 schema guard，回傳空陣列而非 crash
- [風險] TWSE rate limiting（測試環境多次呼叫）→ 緩解：記憶體快取 60 分鐘
- [風險] 台灣節假日前後邊界月份資料可能少於預期 → 接受：對 K 線圖影響小，空白日已由 TvChart 處理
- [Trade-off] 採即時 TWSE 呼叫而非 DB 持久化：歷史回填困難（MAX 範圍），但 Dashboard 主圖短期範圍（1M–1Y）已足夠

## Migration Plan

1. 後端新增 `DashboardService.getTaiexSeries` + controller route + DTO
2. 前端新增 `dashboardApi.getTaiexSeries` call
3. 前端 `Dashboard.vue` 移除 heroStock 邏輯，替換為 TAIEX 邏輯
4. 前端 `Dashboard.spec.ts` 更新 mock
5. 驗證：`pnpm build` + `pnpm test`

無需資料庫 migration。可隨時 rollback（前端 revert）。
