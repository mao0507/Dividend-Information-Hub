## ADDED Requirements

### Requirement: 從 FinMind 抓取配息公告資料
系統 SHALL 透過 FinMind `TaiwanStockDividend` API，取得追蹤股票的配息公告，並 upsert 至 `Dividend` 資料表。

#### Scenario: 成功抓取並 upsert 配息紀錄
- **WHEN** `DividendSyncService.syncStock(code)` 以有效股票代號呼叫
- **THEN** 系統 SHALL 取得該股最近 2 年的配息資料，以 `(stockCode, year, period)` 為 key upsert 至 `Dividend` 資料表，回傳 upsert 筆數

#### Scenario: 不覆蓋系統計算欄位
- **WHEN** Dividend upsert 執行時，資料庫中已有該筆紀錄的 `filled` 或 `fillDays` 值
- **THEN** 系統 SHALL 只更新 FinMind 提供的欄位（`cash`、`exDate`、`payDate`），不修改 `filled` 與 `fillDays`

#### Scenario: FinMind API 失敗時 log 並繼續
- **WHEN** FinMind API 回傳非 200 狀態或網路錯誤
- **THEN** 系統 SHALL log error 含股票代號與錯誤訊息，並繼續處理下一支股票，不中斷整批同步

### Requirement: 每週自動排程同步配息資料
系統 SHALL 每週日 UTC+8 00:00 自動觸發所有追蹤股票的配息同步。

#### Scenario: 週排程觸發全量配息更新
- **WHEN** `SYNC_ENABLED=true` 且到達週排程時間（`0 0 * * 0` Asia/Taipei）
- **THEN** 系統 SHALL 逐支更新 `Stock` 資料表中所有股票的配息，並 log 總 upsert 筆數與耗時
