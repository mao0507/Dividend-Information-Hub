## ADDED Requirements

### Requirement: 透過 TWSE TWT49U 範圍查詢回填歷史配息資料
系統 SHALL 提供可手動觸發的歷史配息回填流程，以年為單位向 TWSE TWT49U API 發送 `startDate+endDate` 範圍查詢（2003 年至今），將全市場真實除息紀錄 upsert 至 `Dividend` 資料表，取代現有的公式假資料。

#### Scenario: 逐年回填寫入真實除息紀錄
- **WHEN** 管理員觸發歷史回填，指定起始年份（預設 2003）
- **THEN** 系統 SHALL 逐年呼叫 TWT49U `?startDate=YYYY0101&endDate=YYYY1231`，將回傳的除息紀錄 upsert 至 `Dividend`，以 `(stockCode, exDate ±3 天)` 比對避免重複，並儲存 `preExClose`（除息前收盤）欄位

#### Scenario: 中斷後可從上次進度續跑
- **WHEN** 回填執行至中途停止，重新啟動時
- **THEN** 系統 SHALL 從 `MarketSyncState`（key=`twse_dividend_history_backfill`）讀取 `lastOkDate`，從最後成功年份的下一年繼續，不重複已完成年份

#### Scenario: 非追蹤股票的配息記錄不寫入
- **WHEN** TWT49U 回傳含有 `Stock` 資料表中不存在代號的除息紀錄
- **THEN** 系統 SHALL 跳過該筆記錄，只寫入 `Stock.code` 已存在的股票

#### Scenario: 單年查詢失敗時記錄並繼續
- **WHEN** 某一年的 TWT49U 請求失敗（HTTP 錯誤或格式異常）
- **THEN** 系統 SHALL log error 含失敗年份，並跳過該年繼續處理下一年，不中止整個回填流程

### Requirement: 回填完成後移除假資料
系統 SHALL 在歷史回填成功完成後，確保 `Dividend` 資料表不再含有由 `prisma/seed.ts` 公式生成的模擬資料；真實 TWT49U 資料以 upsert 方式覆寫同一 `(stockCode, exDate ±3 天)` 的假資料。

#### Scenario: 假資料被真實資料覆蓋
- **WHEN** TWT49U 回填的除息紀錄與現有假資料的 `exDate` 在 ±3 天範圍內
- **THEN** 系統 SHALL 以 TWT49U 的真實 `cash`、`exDate`、`preExClose` 更新現有紀錄，保留 `filled` 與 `fillDays` 不變
