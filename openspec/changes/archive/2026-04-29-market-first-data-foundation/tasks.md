## 1. Schema 擴充

- [x] 1.1 在 `Stock` 新增 `isActive Boolean @default(true)` 欄位並生成 migration
- [x] 1.2 在 `Dividend` 新增 `preExClose Float?` 欄位並生成 migration
- [x] 1.3 確認 `Stock.market` 欄位存在（預設 `"TWSE"`），更新 Prisma schema 註解說明可接受值 `TWSE | TPEX`
- [x] 1.4 執行 `prisma migrate dev` 並驗證 migration 成功套用

## 2. 股票宇宙同步服務（MarketUniverseSyncService）

- [x] 2.1 新增 `MarketUniverseSyncService`，實作 TWSE 來源邏輯：複用 `twse-seed-universe.ts` 的 `STOCK_DAY_ALL` + `t187ap03_L` + `t187ap05_L` 三端點查詢
- [x] 2.2 新增 TPEx 來源邏輯：呼叫 `tpex_mainboard_daily_close_quotes`，解析 `SecuritiesCompanyCode` / `CompanyName`，`market` 設為 `TPEX`
- [x] 2.3 實作 upsert 策略：新代號 INSERT（`isActive=true`）、現有代號 UPDATE `name`、不在清單中的代號設 `isActive=false`
- [x] 2.4 API 失敗時不修改現有 `Stock` 資料，log error 後中止本次刷新
- [x] 2.5 撰寫單元測試：新增、停用、名稱更新、API 失敗不污染 DB 四個情境

## 3. 移除假配息 Seed 資料

- [x] 3.1 從 `prisma/seed.ts` 移除 `DIVIDEND_TEMPLATES` 常數與所有配息生成區塊
- [x] 3.2 確認 seed 執行後 `Dividend` 資料表為空（只有 `Stock` 資料）
- [x] 3.3 更新 seed 腳本，呼叫 `MarketUniverseSyncService` 取代舊 `resolveTwseSeedStocks`，確保 seed 一次性寫入 TWSE + TPEx 全市場

## 4. 配息歷史回填服務（DividendHistoryBackfillService）

- [x] 4.1 新增 `DividendHistoryBackfillService`，逐年呼叫 `TWT49U?startDate=YYYY0101&endDate=YYYY1231`，節流 500ms
- [x] 4.2 實作 upsert 邏輯：以 `(stockCode, exDate ±3 天)` 比對，匹配則更新 `cash`、`exDate`、`preExClose`；不匹配則 INSERT，`period` 自動遞增
- [x] 4.3 解析 TWT49U 回應欄位：`row[1]`=代號、`row[0]`=民國日期（`exDate`）、`row[3]`=除息前收盤（`preExClose`）、`row[5]`=息值（`cash`）
- [x] 4.4 實作斷點續跑：讀寫 `MarketSyncState`（key=`twse_dividend_history_backfill`）`lastOkDate`
- [x] 4.5 單年失敗時 log 並跳過，繼續下一年，不中止整個流程
- [x] 4.6 撰寫單元測試：逐年查詢、upsert 邏輯、斷點續跑、單年失敗不中止

## 5. TPEx 股價同步服務（TpexPriceSyncService）

- [x] 5.1 新增 `TpexPriceSyncService`，呼叫 `tpex_mainboard_daily_close_quotes`（含重試，最多 3 次，500ms base delay）
- [x] 5.2 解析回應欄位：`SecuritiesCompanyCode`=代號、`Open`/`High`/`Low`/`Close`/`TradingShares`=OHLCV
- [x] 5.3 只 upsert `Stock.market='TPEX'` 且 `isActive=true` 的代號至 `StockPrice`，非交易日跳過
- [x] 5.4 格式異常的個別紀錄 log 警告並跳過，不中斷整批
- [x] 5.5 撰寫單元測試：成功寫入、非交易日跳過、格式異常跳過

## 6. 配息同步改用 TWT49U 範圍查詢（DividendSyncService）

- [x] 6.1 修改 `DividendSyncService.syncAll()`：改為以 `startDate=今日-35天`、`endDate=今日` 呼叫 TWT49U，而非逐股呼叫 FinMind
- [x] 6.2 解析 TWT49U 回應並 upsert（含 `preExClose` 欄位），保留不覆蓋 `filled`/`fillDays` 的現有邏輯
- [x] 6.3 將 `FinMindDividendSource` 保留但從預設 source chain 移除（僅 `FINMIND_ENABLED=true` 時啟用）
- [x] 6.4 更新單元測試：驗證 TWT49U 範圍查詢邏輯

## 7. 填息追蹤服務（DividendFillTrackerService）

- [x] 7.1 新增 `DividendFillTrackerService`，查詢所有 `filled=false`、`exDate <= 今日`、`preExClose IS NOT NULL` 的 `Dividend` 紀錄
- [x] 7.2 對每筆紀錄查詢 `StockPrice`（`exDate` 之後，`close >= preExClose`），找到第一個填息日
- [x] 7.3 計算 `fillDays` = exDate 至填息日之間的 `StockPrice` 紀錄數（交易日數）
- [x] 7.4 填息時 UPDATE `filled=true`、`fillDays=N`；未填息時維持不變
- [x] 7.5 `preExClose` 為 null 的紀錄跳過，log 含代號與 exDate
- [x] 7.6 撰寫單元測試：填息判斷、fillDays 計算、preExClose 缺失跳過、StockPrice 缺資料不誤判

## 8. 排程器更新（SyncSchedulerService）

- [x] 8.1 每日 15:30 排程新增 `TpexPriceSyncService.syncDate()`，TWSE 失敗不影響 TPEx 執行
- [x] 8.2 每日 16:00 新增 `DividendFillTrackerService.track()` Cron job（`0 16 * * 1-5` Asia/Taipei）
- [x] 8.3 每週日 01:00 新增 `MarketUniverseSyncService.refresh()` Cron job（`0 1 * * 0` Asia/Taipei）
- [x] 8.4 修改 `POST /data-sync/trigger` 回應格式：`{ twsePriceRows, tpexPriceRows, dividendRows, durationMs }`
- [x] 8.5 新增 `POST /data-sync/backfill-dividends` 端點，支援 `?fromYear=YYYY`，非同步啟動回填，執行中回傳 409 含進度

## 9. 資料遷移執行

- [x] 9.1 執行一次性股票宇宙全量刷新（`POST /data-sync/trigger-universe-refresh`），確認 TWSE+TPEx 共 11,886 筆寫入
- [x] 9.2 執行歷史配息回填（`POST /data-sync/backfill-dividends?fromYear=2003`），完成 13,498 筆配息（含 preExClose 13,079 筆）
- [x] 9.3 執行 `DividendFillTrackerService` 初始計算，確認 10,598 筆 `filled=true`（fillDays 1–189 天）
- [x] 9.4 確認 `prisma/seed.ts` 假配息區塊已移除（Phase 3 完成）

## 10. 整合驗證

- [x] 10.1 查詢 `Stock` 資料表：TPEX 10,530 股活躍、`isActive` 欄位正確
- [x] 10.2 查詢 `Dividend` 資料表：2330 含真實配息，2026 Q1 preExClose=1845
- [x] 10.3 驗證 `StockPrice`：上櫃股票 3037 有 2026-04-28 最新收盤 825
- [x] 10.4 確認 filled=true 且 fillDays 合理：00929（1天）、4764（5天）等多筆
- [x] 10.5 Cron job 已在 `SYNC_ENABLED=true` 環境下正確登錄（排程器程式碼驗證）
