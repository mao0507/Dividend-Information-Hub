## Why

目前系統的股票清單為一次性 seed、配息歷史為公式生成的假資料、且完全未涵蓋上櫃（TPEx）市場——使用者在選股追蹤之前，看到的是不完整且不正確的市場資料。需要先建立完整、真實的上市上櫃資料基礎，才能讓選股功能有意義。

## What Changes

- **架構翻轉**：由「DB-first（只同步 DB 裡有的股票）」改為「Market-first（DB 反映完整市場，使用者從中選股）」
- **股票宇宙週期更新**：每週自動比對 TWSE + TPEx 全市場清單與 DB，新增上市/下市標記，`Stock.market` 區分 TWSE / TPEX，新增 `Stock.isActive` 欄位取代刪除
- **TWSE 配息歷史回填**：利用 TWT49U `startDate+endDate` 參數（驗證可回溯至 2003 年），將所有上市股票的真實配息紀錄寫入 DB，取代現有的公式假資料
- **上櫃（TPEx）股價同步**：透過 `tpex_mainboard_daily_close_quotes` 每日同步 TPEx 收盤行情
- **填息追蹤計算**：依除息日後收盤價回推 `filled` 與 `fillDays`，補上現有 schema 中永遠為空的欄位
- **同步健康狀態**：可查詢各市場最後成功同步日與覆蓋率

## Capabilities

### New Capabilities

- `market-universe-sync`: 上市（TWSE）與上櫃（TPEx）股票清單的週期性全量同步，含新上市、下市標記、產業別維護
- `dividend-history-backfill`: 透過 TWSE TWT49U `startDate+endDate` 範圍查詢，一次性回填 2003 年至今全市場真實除息紀錄
- `tpex-price-sync`: 每日盤後透過 TPEx `tpex_mainboard_daily_close_quotes` 同步上櫃收盤行情
- `dividend-fill-tracker`: 除息後每日比對收盤價，計算並回寫 `Dividend.filled` / `Dividend.fillDays`

### Modified Capabilities

- `dividend-sync`: 現有同步邏輯由「抓今日 TWT49U」改為「每週以 startDate+endDate 掃描過去 30 天」，確保不漏接；取消假資料 seed
- `twse-seed-stock-universe`: 由一次性腳本升級為可重複執行的週期刷新服務，整合 TPEx 來源
- `stock-price-sync`: 新增 `market` 欄位路由，TWSE 走原有路徑，TPEX 走新的 TPEx API
- `sync-scheduler`: 新增週期任務——股票宇宙刷新（每週）、填息追蹤計算（每日盤後）

## Impact

- **Schema**：`Stock` 新增 `isActive Boolean`；`market` 欄位由 `@default("TWSE")` 擴展支援 `"TPEX"`
- **Service**：新增 `MarketUniverseSyncService`、`DividendHistoryBackfillService`、`TpexPriceSyncService`、`DividendFillTrackerService`
- **Seed**：`prisma/seed.ts` 的假配息 template 區塊全部移除，改由 `DividendHistoryBackfillService` 提供真實資料
- **外部 API**：新增 TPEx `tpex_mainboard_daily_close_quotes` 依賴；TWSE TWT49U 新增 `startDate+endDate` 查詢模式
- **Cron**：新增 2 個排程任務，總 cron job 數由 2 升為 4
