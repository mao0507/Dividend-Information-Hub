## MODIFIED Requirements

### Requirement: 單點價格驗證必須回傳結構化比對結果
系統 MUST 提供針對單一 `stockCode` 與 `date` 的價格驗證能力，並回傳至少以下欄位：
- 正規化後查詢日期（台北日曆）
- 是否交易日
- DB 收盤價與來源收盤價（若存在）
- 比對狀態（`MATCH`/`NOT_TRADING_DAY`/`MISSING_IN_DB`/`MISSING_IN_SOURCE`/`VALUE_MISMATCH`/`PARSE_ERROR`）
- 可讀性原因訊息
- 同步診斷欄位（至少含 `lastSyncedTradingDate` 與 `syncStatus`）

#### Scenario: 驗證結果一致
- **WHEN** 使用者查詢 `stockCode=2330` 且日期為交易日，且 DB 與 TWSE 同步一致
- **THEN** 系統回傳狀態 `MATCH`
- **AND** 回傳 DB 與來源收盤價且兩者相等

#### Scenario: DB 缺漏但同步尚未完成
- **WHEN** 驗證請求日期晚於最近成功同步交易日且 DB 無值
- **THEN** 系統回傳 `SYNC_NOT_READY` 或同等語意
- **AND** 回傳最近同步交易日與建議處置訊息

### Requirement: 驗證流程必須重用既有同步來源與時區規則
系統 MUST 使用與股價同步一致的 TWSE 來源與 `Asia/Taipei` 日期正規化規則，確保驗證與同步結果可直接對照；且 MUST 與儀表板圖表查詢共用同一組日期正規化策略，避免查詢與驗證判定分歧。

#### Scenario: 時區一致性
- **WHEN** 驗證請求帶入任意時區日期字串
- **THEN** 系統以台北日曆日進行來源查詢與 DB 比對
- **AND** 回傳中包含正規化後日期供排查使用
