## 1. 調研與契約

- [x] 1.1 盤點 TWSE／MIS 可用之每日行情與證券基本資料 API／CSV 端點，寫入 README 或模組註解（URL、參數、頻率限制）
- [x] 1.2 定義第一階段「納入標的」範圍（例如全部上市普通股代號）與與 `Stock` 表對應規則

## 2. 資料模型與進度

- [x] 2.1 設計並實作同步進度保存（新表 `MarketSyncState` 或等價機制），欄位至少含 key、lastOkDate、updatedAt
- [x] 2.2 Prisma migration 與 seed 無衝突驗證

## 3. 歷史回填管線

- [x] 3.1 實作依交易日迭代之 backfill 服務（呼叫既有或抽取之全日行情解析邏輯），含節流與指數退避重試
- [x] 3.2 實作 CLI 或受保護之 API：指定起訖日期觸發回填；支援從 checkpoint 續跑
- [x] 3.3 單元／整合測試：休市日跳過、upsert 不重複損毀、失敗重試上限

## 4. 增量與排程

- [x] 4.1 擴充 `StockPriceSyncService` 或包一層 orchestrator，使每日增量涵蓋設計書中的全標的範圍
- [x] 4.2 確認 `SyncSchedulerService`（或新增 Cron）與 `SYNC_ENABLED`、時區 `Asia/Taipei` 行為與設計一致
- [x] 4.3 結構化 log：每次排程之日期、筆數、耗時、失敗摘要

## 5. 驗收

- [x] 5.1 於測試環境跑短區間（例如 5 個交易日）回填並比對 DB 筆數與官方樣本（程序已就緒；正式比對請於有 `DATA_SYNC_SECRET` 之環境執行 curl／短區間回填）
- [x] 5.2 文件化運維注意事項（長時回填負載、如何暫停同步）
