## 1. 安裝套件與模組骨架

- [x] 1.1 在 `backend/` 安裝 `@nestjs/schedule` 套件
- [x] 1.2 建立目錄 `backend/src/data-sync/` 與以下空檔案：`data-sync.module.ts`、`data-sync.controller.ts`、`stock-price-sync.service.ts`、`dividend-sync.service.ts`、`sync-scheduler.service.ts`
- [x] 1.3 在 `AppModule` 加入 `ScheduleModule.forRoot()` 與 `DataSyncModule` imports

## 2. TWSE 股價 Adapter

- [x] 2.1 在 `stock-price-sync.service.ts` 實作 `fetchTwseDayAll(date: Date)` — 呼叫 `https://www.twse.com.tw/rwd/zh/afterTrading/STOCK_DAY_ALL?date={YYYYMMDD}&response=json`，以 Zod schema 驗證回傳格式
- [x] 2.2 實作 `syncDate(date: Date): Promise<number>` — 解析回傳資料、過濾非追蹤股票，以 `(stockCode, date)` upsert `StockPrice`；回傳 upsert 筆數
- [x] 2.3 處理非交易日（TWSE 回傳空陣列）：安全跳過並 log

## 3. FinMind 配息 Adapter

- [x] 3.1 在 `dividend-sync.service.ts` 實作 `fetchFinMindDividend(code: string, startDate: string)` — 呼叫 FinMind `TaiwanStockDividend` dataset，Zod 驗證回傳
- [x] 3.2 實作 `syncStock(code: string): Promise<number>` — 解析 FinMind 欄位（`cash_dividend`、`ex_dividend_trading_date`、`dividend_pay_date`）並 upsert `Dividend`；不覆蓋 `filled`、`fillDays`
- [x] 3.3 實作 `syncAll(): Promise<number>` — 查詢 DB 所有 `Stock.code`，逐批（concurrency ≤ 10）呼叫 `syncStock`，收集失敗清單

## 4. 排程器與手動觸發

- [x] 4.1 在 `sync-scheduler.service.ts` 建立 `@Cron('30 15 * * 1-5', { timeZone: 'Asia/Taipei' })` 方法 `scheduleDailyPrice()` — 僅在 `SYNC_ENABLED=true` 時執行，呼叫 `StockPriceSyncService.syncDate(today)`
- [x] 4.2 建立 `@Cron('0 0 * * 0', { timeZone: 'Asia/Taipei' })` 方法 `scheduleWeeklyDividend()` — 呼叫 `DividendSyncService.syncAll()`
- [x] 4.3 在 `data-sync.controller.ts` 實作 `POST /data-sync/trigger`：先取得 `isRunning` guard（避免重複執行），執行完整同步後回傳 `{ priceRows, dividendRows, durationMs }`
- [x] 4.4 在 `SyncSchedulerService` 加入 `isRunning` flag，重複觸發時回傳 `409 Conflict`

## 5. 結構化 Log

- [x] 5.1 在每次同步完成後，使用 NestJS `Logger` 記錄 `{ type, date, rowsUpserted, durationMs, status }` JSON
- [x] 5.2 部分失敗時記錄 `status: 'partial'` 與失敗股票代號清單

## 6. 環境變數設定

- [x] 6.1 在 `backend/.env.example` 新增 `SYNC_ENABLED=false`、`SYNC_CRON=30 15 * * 1-5`、`FINMIND_TOKEN=`（可選）
- [x] 6.2 在 `SyncSchedulerService` 透過 `ConfigService` 讀取 `SYNC_ENABLED`，為 false 時跳過排程執行

## 7. 測試

- [x] 7.1 為 `StockPriceSyncService.syncDate` 撰寫單元測試：mock TWSE HTTP 回應，驗證 upsert 呼叫次數與非交易日跳過行為
- [x] 7.2 為 `DividendSyncService.syncStock` 撰寫單元測試：mock FinMind 回應，驗證 upsert 欄位正確且不覆蓋 `filled`
- [x] 7.3 驗證 `POST /data-sync/trigger` 在 `isRunning=true` 時回傳 409
