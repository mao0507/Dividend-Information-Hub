## ADDED Requirements

### Requirement: 每週自動同步 TWSE 與 TPEx 完整股票清單
系統 SHALL 每週日自動從 TWSE 與 TPEx 官方公開來源取得全市場上市上櫃股票清單，並將結果 upsert 至 `Stock` 資料表，新增上市股票、標記已下市股票為 `isActive=false`，不刪除任何歷史資料。

#### Scenario: 新上市股票自動加入
- **WHEN** 週期刷新執行，且 TWSE / TPEx 清單含有 `Stock` 資料表中不存在的代號
- **THEN** 系統 SHALL 以 `isActive=true` 新增該股票至 `Stock` 資料表，包含名稱、市場（TWSE/TPEX）與產業別

#### Scenario: 已下市股票標記為非活躍
- **WHEN** 週期刷新執行，且 `Stock` 資料表中某代號不再出現於最新官方清單
- **THEN** 系統 SHALL 將該股票 `isActive` 設為 `false`，不刪除該紀錄，保留其所有關聯的 `Dividend` 與 `StockPrice` 歷史資料

#### Scenario: 股票名稱更新
- **WHEN** 官方清單中某代號的公司名稱與 DB 現有值不同
- **THEN** 系統 SHALL 更新 `Stock.name`，保持 `isActive` 不變

#### Scenario: TWSE 來源無法連線時不清空清單
- **WHEN** TWSE API 請求失敗或回傳非預期格式
- **THEN** 系統 SHALL log error 並中止本次刷新，不修改任何現有 `Stock` 紀錄

### Requirement: Stock 資料表支援 TWSE 與 TPEX 市場區分
系統 SHALL 透過 `Stock.market` 欄位區分上市（`TWSE`）與上櫃（`TPEX`）股票，並以 `Stock.isActive` 標記當前狀態。

#### Scenario: 市場欄位正確設定
- **WHEN** 從 TWSE 來源寫入股票
- **THEN** `Stock.market` SHALL 為 `TWSE`

#### Scenario: 上櫃股票市場欄位
- **WHEN** 從 TPEx 來源寫入股票
- **THEN** `Stock.market` SHALL 為 `TPEX`

#### Scenario: 前端查詢可過濾活躍股票
- **WHEN** 前端查詢股票清單
- **THEN** 系統 SHALL 支援以 `isActive=true` 過濾，排除已下市股票
