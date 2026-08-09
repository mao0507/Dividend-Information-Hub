# tpex-price-sync Specification

## Purpose
每日同步上櫃（TPEx）股票收盤行情，與 TWSE 股價共用 StockPrice 資料表，提供統一查詢介面。

## Requirements

### Requirement: 每日同步上櫃股票收盤行情
系統 SHALL 透過 TPEx `tpex_mainboard_daily_close_quotes` API 取得上櫃全市場收盤 OHLCV 資料，過濾 `Stock.market='TPEX'` 的代號後 upsert 至 `StockPrice` 資料表，與上市股價共用同一資料表。

#### Scenario: 成功取得並寫入上櫃收盤行情
- **WHEN** `TpexPriceSyncService.syncDate(date)` 以有效交易日日期呼叫
- **THEN** 系統 SHALL 發出一次 TPEx API 請求，將回傳中對應 `Stock.market='TPEX'` 代號的 OHLCV upsert 至 `StockPrice`，回傳成功寫入筆數

#### Scenario: 非交易日不寫入任何資料
- **WHEN** TPEx API 回傳空資料或無效格式（例如休市日）
- **THEN** 系統 SHALL 安全跳過，不寫入任何資料，log 跳過原因

#### Scenario: TPEx API 格式異常不中斷服務
- **WHEN** TPEx API 回傳缺少必要欄位的個別紀錄
- **THEN** 系統 SHALL log 警告並跳過該筆資料，繼續處理其餘正常資料

#### Scenario: 只處理已存在於 Stock 資料表的上櫃代號
- **WHEN** TPEx API 回傳含 `Stock` 資料表中不存在的上櫃代號
- **THEN** 系統 SHALL 跳過該代號，不自動新增 Stock 紀錄

### Requirement: 上市上櫃股價統一查詢介面
系統 SHALL 使前端及後端服務在查詢 `StockPrice` 時，無需區分股票市場（TWSE/TPEX）即可取得正確資料。

#### Scenario: 上櫃股票行情可透過現有 StockPrice 查詢
- **WHEN** 前端或服務以 `stockCode='3037'`（上櫃股票）查詢 `StockPrice`
- **THEN** 系統 SHALL 回傳該股票的收盤行情，與 TWSE 股票查詢行為一致
