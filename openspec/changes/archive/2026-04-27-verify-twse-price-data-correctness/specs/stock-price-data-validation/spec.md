## ADDED Requirements

### Requirement: 單點價格驗證必須回傳結構化比對結果
系統 MUST 提供針對單一 `stockCode` 與 `date` 的價格驗證能力，並回傳至少以下欄位：
- 正規化後查詢日期（台北日曆）
- 是否交易日
- DB 收盤價與來源收盤價（若存在）
- 比對狀態（`MATCH`/`NOT_TRADING_DAY`/`MISSING_IN_DB`/`MISSING_IN_SOURCE`/`VALUE_MISMATCH`/`PARSE_ERROR`）
- 可讀性原因訊息

#### Scenario: 驗證結果一致
- **WHEN** 使用者查詢 `stockCode=2330` 且日期為交易日，且 DB 與 TWSE 同步一致
- **THEN** 系統回傳狀態 `MATCH`
- **AND** 回傳 DB 與來源收盤價且兩者相等

### Requirement: 非交易日必須明確標示，不得誤判為數值錯誤
系統 MUST 在來源資料為休市或無成交資料時，優先判斷並回傳 `NOT_TRADING_DAY`（或同等語意），不得直接將該情況標示為 `VALUE_MISMATCH`。

#### Scenario: 週末日期查詢
- **WHEN** 使用者查詢 `2330` 於 `2026-04-26` 且該日非交易日
- **THEN** 系統回傳 `NOT_TRADING_DAY`
- **AND** 說明此日無官方成交資料可比對

### Requirement: 驗證流程必須重用既有同步來源與時區規則
系統 MUST 使用與股價同步一致的 TWSE 來源與 `Asia/Taipei` 日期正規化規則，確保驗證與同步結果可直接對照。

#### Scenario: 時區一致性
- **WHEN** 驗證請求帶入任意時區日期字串
- **THEN** 系統以台北日曆日進行來源查詢與 DB 比對
- **AND** 回傳中包含正規化後日期供排查使用
