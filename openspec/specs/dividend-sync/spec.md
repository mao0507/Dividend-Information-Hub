# dividend-sync Specification

## Purpose
透過 TWSE TWT49U 批量範圍查詢同步配息資料並 upsert 至資料庫，支援每週自動排程同步；FinMind 整合保留為選配來源。

## Requirements

### Requirement: 每週自動排程同步配息資料
系統 SHALL 每週日 UTC+8 00:00 自動觸發 TWSE TWT49U 範圍查詢，抓取過去 35 天（含可能延遲公告）的全市場除息結果，upsert 至 `Dividend` 資料表；不再以逐股方式呼叫 FinMind API 作為主要同步手段。

#### Scenario: 週排程觸發 TWT49U 範圍查詢
- **WHEN** `SYNC_ENABLED=true` 且到達週排程時間（`0 0 * * 0` Asia/Taipei）
- **THEN** 系統 SHALL 以 `startDate=今日-35天`、`endDate=今日` 呼叫 TWT49U，將回傳的全市場除息紀錄 upsert 至 `Dividend`，並 log 總 upsert 筆數與耗時

#### Scenario: 不覆蓋系統計算欄位
- **WHEN** Dividend upsert 執行時，資料庫中已有該筆紀錄的 `filled` 或 `fillDays` 值
- **THEN** 系統 SHALL 只更新來源提供的欄位（`cash`、`exDate`、`preExClose`），不修改 `filled` 與 `fillDays`

#### Scenario: TWT49U API 失敗時 log 並不寫入
- **WHEN** TWT49U API 回傳非 200 狀態或網路錯誤
- **THEN** 系統 SHALL log error 含查詢日期範圍與錯誤訊息，不寫入任何資料，等待下次週排程重試
