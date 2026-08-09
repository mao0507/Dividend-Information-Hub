## Why

目前系統的股票價格與配息資料全部來自 `prisma/seed.ts` 的靜態假資料，導致 Dashboard KPI、排行榜殖利率、填息進度等所有頁面顯示的都是過時的假數字，無法反映真實市場狀況。為讓產品具備實際使用價值，需建立後端定期自動抓取真實市場資料的機制。

## What Changes

- **新增** `DataSyncModule`（`backend/src/data-sync/`）：封裝對外部資料來源的抓取邏輯
- **新增** `TwseAdapterService`：對台灣證交所（TWSE）公開 API 抓取每日收盤股價
- **新增** `TwseDividendAdapterService`：抓取除息公告日期與配息金額
- **新增** `StockSyncService`：整合兩個 adapter，負責寫入 / 更新 Prisma DB（upsert）
- **新增** `SyncSchedulerService`：使用 `@nestjs/schedule` Cron 每日盤後（台灣時間 15:00）觸發同步
- **新增** `POST /data-sync/trigger`（管理用手動觸發端點，僅限 localhost / 環境變數開關）
- **修改** `prisma/seed.ts`：保留作為 dev 環境初始資料，不刪除；生產環境改由 SyncSchedulerService 維護

## Capabilities

### New Capabilities

- `stock-price-sync`: 每日從 TWSE 抓取所有追蹤股票的 OHLCV 收盤資料並 upsert 至 StockPrice 資料表
- `dividend-sync`: 週期性抓取 TWSE/MOPS 除息公告，更新 Dividend 資料表的 exDate、payDate、cash 欄位
- `sync-scheduler`: 定時排程，每日盤後自動觸發價格與配息同步，並記錄同步結果至 log

### Modified Capabilities

<!-- 無既有 spec 需要修改 -->

## Impact

- **後端新模組**: `backend/src/data-sync/`（新增，不影響現有模組）
- **外部依賴新增**: `@nestjs/schedule`、`node-cron`（或 NestJS 內建 scheduler）
- **外部 API**: TWSE 公開 API（免費，無需申請 key）
- **資料庫**: `StockPrice` 與 `Dividend` 資料表會被定期 upsert，現有 seed 資料不衝突
- **前端**: 無需修改，資料層透明換成真實資料
- **環境變數新增**: `SYNC_ENABLED`（bool，控制排程是否啟動）、`SYNC_CRON`（自訂 cron expression）
