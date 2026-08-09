## ADDED Requirements

### Requirement: 從 TWSE 抓取每日收盤股價
系統 SHALL 透過 TWSE `STOCK_DAY_ALL` 公開 API，取得指定日期所有上市股票的 OHLCV 收盤資料，並 upsert 至 `StockPrice` 資料表。

#### Scenario: 成功抓取並寫入當日股價
- **WHEN** `StockPriceSyncService.syncDate(date)` 以有效交易日日期呼叫
- **THEN** 系統 SHALL 發出一次 TWSE API 請求，將回傳中對應已追蹤 `Stock.code` 的紀錄 upsert 至 `StockPrice`，並回傳成功寫入筆數

#### Scenario: 非交易日（假日）不寫入任何資料
- **WHEN** TWSE API 因非交易日回傳空資料或錯誤狀態
- **THEN** 系統 SHALL 安全跳過，不寫入任何資料，並 log 跳過原因

#### Scenario: TWSE API 回應格式非預期時不中斷服務
- **WHEN** TWSE API 回傳缺少必要欄位的資料
- **THEN** 系統 SHALL log 警告並跳過該筆資料，繼續處理其餘正常資料

#### Scenario: 只更新已存在於 Stock 資料表的股票
- **WHEN** TWSE API 回傳含未知股票代號的資料
- **THEN** 系統 SHALL 只處理 `Stock` 資料表已存在的代號，不自動新增 Stock 紀錄

### Requirement: 每日盤後自動排程同步股價
系統 SHALL 在每個台灣交易日 15:30（UTC+8）自動觸發股價同步，不需人工介入。

#### Scenario: 排程在設定時間自動觸發
- **WHEN** `SYNC_ENABLED=true` 且到達 Cron 設定時間（預設 `30 15 * * 1-5` Asia/Taipei）
- **THEN** 系統 SHALL 自動呼叫當日股價同步，並將結果記錄至 logger

#### Scenario: SYNC_ENABLED=false 時不啟動排程
- **WHEN** 環境變數 `SYNC_ENABLED` 未設定或為 `false`
- **THEN** 排程 SHALL 不啟動，服務正常啟動不報錯
