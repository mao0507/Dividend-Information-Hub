## ADDED Requirements

### Requirement: 手動觸發同步端點
系統 SHALL 提供 `POST /data-sync/trigger` HTTP 端點，允許管理人員手動觸發一次完整的資料同步（股價 + 配息）。

#### Scenario: 手動觸發成功回傳同步摘要
- **WHEN** 發出 `POST /data-sync/trigger` 請求
- **THEN** 系統 SHALL 執行股價同步與配息同步，並回傳 JSON 摘要：`{ priceRows: number, dividendRows: number, durationMs: number }`

#### Scenario: 同步進行中再次呼叫不重複執行
- **WHEN** 同步正在執行中，再次收到 `POST /data-sync/trigger`
- **THEN** 系統 SHALL 回傳 `409 Conflict` 並說明目前正在同步中

### Requirement: 同步結果結構化 Log
系統 SHALL 在每次同步完成（成功或失敗）後，以結構化格式記錄同步結果至 NestJS Logger。

#### Scenario: 成功同步後記錄摘要 log
- **WHEN** 一次同步週期完成
- **THEN** Logger SHALL 記錄包含 `{ type, date, rowsUpserted, durationMs, status: 'success' }` 的結構化訊息

#### Scenario: 同步過程有部分失敗時記錄警告 log
- **WHEN** 同步過程中某些股票抓取失敗，其餘成功
- **THEN** Logger SHALL 記錄 `status: 'partial'`，並列出失敗的股票代號清單
