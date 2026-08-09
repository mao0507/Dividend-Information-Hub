## Why

Dashboard 已有 TAIEX K 線圖 UI（`Dashboard.vue` lines 39-72），但圖表顯示空白。根本原因：`StockPrice` 資料表缺乏 TAIEX 歷史收盤資料，且 `querySourceFallbackRows` 使用 `parseTwseMiIndexQuotes`（解析個股行情），無法從回應中取得指數收盤值，導致 fallback 一律回傳 `[]`。

## What Changes

- **修正 fallback 邏輯**：`querySourceFallbackRows` 對 `TAIEX` 代號改呼叫 `parseTwseMiIndexTaiex`，讓當日無 DB 資料時至少能回傳今日收盤點
- **新增 TAIEX 歷史回填 API**：新增 `POST /admin/data-sync/taiex-backfill` 端點，觸發對指定日期範圍逐日呼叫 `syncDate`，將歷史 TAIEX 收盤點寫入 `StockPrice`
- **新增診斷端點**：新增 `GET /admin/data-sync/taiex-status` 查詢 DB 中 TAIEX 最早/最新資料日期與筆數，確認資料完整度
- 前端 Dashboard.vue 已完成，無需修改

## Capabilities

### New Capabilities

- `taiex-backfill-api`: 觸發 TAIEX 歷史收盤回填的 Admin API 端點，含診斷查詢

### Modified Capabilities

（無）

## Impact

- `backend/src/data-sync/data-sync.controller.ts`：新增兩個 admin 端點
- `backend/src/stock/stock.service.ts`：修正 `querySourceFallbackRows` 對 TAIEX 的 fallback 邏輯
- 資料庫：執行回填後 `StockPrice` 寫入大量 TAIEX 歷史資料（每個交易日 1 筆）
