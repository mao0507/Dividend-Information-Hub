# holding-management Specification

## Purpose
確保持股 lot 建立、刪除及列表功能遵循統一資料契約，並維持 lot 明細與持股彙總之間的一致性。

## Requirements
### Requirement: 系統必須支援建立持股買入 lot 明細
系統 MUST 提供受保護 API 讓使用者建立買入 lot，且每筆 lot MUST 包含 `stockCode`、`buyDate`、`buyPrice`、`shares`；若任一欄位缺漏或格式不合法，系統 MUST 拒絕請求。

#### Scenario: 建立合法 lot
- **WHEN** 使用者送出合法的股票代碼、買入日期、買入價格與買入數量
- **THEN** 系統 SHALL 建立一筆 lot 並回傳建立結果

#### Scenario: 建立 lot 欄位不合法
- **WHEN** `buyPrice` 或 `shares` 為非正值，或 `stockCode` 不存在
- **THEN** 系統 SHALL 回傳驗證錯誤並不得建立 lot

### Requirement: 系統必須維持持股彙總與 lot 一致
系統 MUST 在每次 lot 建立後更新對應股票的持股彙總資料（總股數、加權平均成本、最早買入日），並確保同一使用者同一股票僅有一筆彙總紀錄。

#### Scenario: 首次建立某股票 lot
- **WHEN** 使用者第一次建立某股票 lot
- **THEN** 系統 SHALL 建立該股票對應彙總紀錄，股數與成本等於該 lot

#### Scenario: 已有彙總再新增 lot
- **WHEN** 使用者對同一股票再次建立 lot
- **THEN** 系統 SHALL 更新既有彙總紀錄，股數累加且平均成本依加權規則重算

### Requirement: 系統必須回傳可展開的持股列表
系統 MUST 提供持股查詢 API，回傳每檔股票彙總資訊，且每檔 MUST 附帶可展開的 lot 明細清單，供前端顯示彙總與明細。

#### Scenario: 使用者已有多檔持股
- **WHEN** 使用者呼叫持股列表 API
- **THEN** 系統 SHALL 回傳每檔彙總資料與對應 lot 陣列

#### Scenario: 使用者尚無持股
- **WHEN** 使用者呼叫持股列表 API 且沒有任何 lot
- **THEN** 系統 SHALL 回傳空陣列且不得回傳錯誤
