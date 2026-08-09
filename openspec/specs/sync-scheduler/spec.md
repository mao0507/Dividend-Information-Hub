# sync-scheduler Specification

## Purpose
提供手動觸發同步的 HTTP 端點，管理 TWSE/TPEx 股價、配息、股票宇宙與填息追蹤的自動排程，並確保同步結果以結構化格式記錄至 Logger。

## Requirements

### Requirement: 手動觸發同步端點
系統 SHALL 提供 `POST /data-sync/trigger` HTTP 端點，允許管理人員手動觸發一次完整的資料同步（TWSE 股價 + TPEx 股價 + 配息）。

#### Scenario: 手動觸發成功回傳同步摘要
- **WHEN** 發出 `POST /data-sync/trigger` 請求
- **THEN** 系統 SHALL 執行 TWSE 股價同步、TPEx 股價同步與 TWSE 配息同步，並回傳 JSON 摘要：`{ twsePriceRows: number, tpexPriceRows: number, dividendRows: number, durationMs: number }`

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

### Requirement: 每週股票宇宙刷新排程
系統 SHALL 每週日 01:00（UTC+8，配息同步後）自動執行股票宇宙刷新（`MarketUniverseSyncService`），更新 TWSE + TPEx 全市場股票清單。

#### Scenario: 週排程觸發股票清單刷新
- **WHEN** `SYNC_ENABLED=true` 且到達 `0 1 * * 0` Asia/Taipei
- **THEN** 系統 SHALL 呼叫 `MarketUniverseSyncService.refresh()`，log 新增筆數、停用筆數與總耗時

#### Scenario: 宇宙刷新失敗不影響其他排程
- **WHEN** `MarketUniverseSyncService` 執行失敗
- **THEN** 系統 SHALL log error，不影響配息同步或股價同步排程的執行

### Requirement: 每日填息追蹤計算排程
系統 SHALL 在每日股價同步完成後（16:00 UTC+8），自動執行 `DividendFillTrackerService` 掃描並更新填息狀態。

#### Scenario: 每日排程觸發填息計算
- **WHEN** `SYNC_ENABLED=true` 且到達 `0 16 * * 1-5` Asia/Taipei
- **THEN** 系統 SHALL 呼叫 `DividendFillTrackerService.track()`，log 處理筆數（已填息新標記數）與耗時

### Requirement: 手動觸發歷史配息回填端點
系統 SHALL 提供 `POST /data-sync/backfill-dividends` HTTP 端點，允許管理員手動啟動或重啟歷史配息回填，支援指定起始年份參數。

#### Scenario: 手動觸發歷史回填
- **WHEN** 發出 `POST /data-sync/backfill-dividends?fromYear=2003` 請求
- **THEN** 系統 SHALL 非同步啟動 `DividendHistoryBackfillService`，立即回傳 `{ status: 'started', fromYear: 2003 }`，並於背景執行回填

#### Scenario: 回填進行中再次呼叫回傳當前進度
- **WHEN** 回填正在進行中，再次收到 `POST /data-sync/backfill-dividends`
- **THEN** 系統 SHALL 回傳 `409 Conflict` 含當前進度資訊（已完成年份、剩餘年份）
