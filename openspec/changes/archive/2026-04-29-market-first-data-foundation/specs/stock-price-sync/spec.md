## MODIFIED Requirements

### Requirement: 從 TWSE 抓取每日收盤股價
系統 SHALL 透過 TWSE `STOCK_DAY_ALL` 公開 API，取得指定日期所有上市股票的 OHLCV 收盤資料，並 upsert 至 `StockPrice` 資料表；僅處理 `Stock.market='TWSE'` 且 `Stock.isActive=true` 的代號。

#### Scenario: 成功抓取並寫入當日股價
- **WHEN** `StockPriceSyncService.syncDate(date)` 以有效交易日日期呼叫
- **THEN** 系統 SHALL 發出一次 TWSE API 請求，將回傳中對應 `Stock.market='TWSE'` 且 `isActive=true` 代號的紀錄 upsert 至 `StockPrice`，並回傳成功寫入筆數

#### Scenario: 非交易日（假日）不寫入任何資料
- **WHEN** TWSE API 因非交易日回傳空資料或錯誤狀態
- **THEN** 系統 SHALL 安全跳過，不寫入任何資料，並 log 跳過原因

#### Scenario: TWSE API 回應格式非預期時不中斷服務
- **WHEN** TWSE API 回傳缺少必要欄位的資料
- **THEN** 系統 SHALL log 警告並跳過該筆資料，繼續處理其餘正常資料

#### Scenario: 只更新已存在於 Stock 資料表的上市股票
- **WHEN** TWSE API 回傳含未知股票代號的資料
- **THEN** 系統 SHALL 只處理 `Stock` 資料表已存在且 `market='TWSE'` 的代號，不自動新增 Stock 紀錄

## ADDED Requirements

### Requirement: 每日盤後股價同步涵蓋 TWSE 與 TPEX 雙市場
系統 SHALL 在每個台灣交易日 15:30（UTC+8）依序觸發 TWSE 股價同步與 TPEx 股價同步，確保 `StockPrice` 資料表涵蓋全市場上市上櫃收盤行情。

#### Scenario: 每日排程依序同步雙市場
- **WHEN** `SYNC_ENABLED=true` 且到達 `30 15 * * 1-5` Asia/Taipei
- **THEN** 系統 SHALL 先執行 TWSE `StockPriceSyncService.syncDate`，再執行 `TpexPriceSyncService.syncDate`，分別記錄各市場寫入筆數至 Logger

#### Scenario: 其中一市場同步失敗不中止另一市場
- **WHEN** TWSE 同步成功但 TPEx 同步失敗（或反之）
- **THEN** 系統 SHALL log 失敗市場的 error，繼續執行另一市場，回報 `status: 'partial'`
