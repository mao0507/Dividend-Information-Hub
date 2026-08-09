## MODIFIED Requirements

### Requirement: Hero 報價漲跌幅須有可驗證之基準價
對外提供之個股詳情 API（含儀表板 Hero 所用之同一資料來源）在回傳 `change` 與 `changePct` 時 MUST 使用同一檔股票於資料庫中「最新收盤價之前一筆交易日收盤價」為基準；若不存在該基準（例如僅有一筆價格紀錄），則 MUST 將漲跌額與漲跌幅設為零，不得回傳基於無效基準計算之百分比。Dashboard 中 Hero 與四個統計卡 MUST 共用同一批次的資料時間基準（`asOf` 或同等欄位）進行 freshness 判定。

#### Scenario: 至少兩筆歷史收盤價
- **WHEN** 該股票於資料庫中存在至少兩筆依日期排序之收盤價紀錄
- **THEN** 系統 SHALL 以最新收盤價減去前一交易日收盤價計算 `change`，並以該前一交易日收盤價為分母計算 `changePct`

#### Scenario: 僅一筆收盤價
- **WHEN** 該股票僅存在一筆收盤價紀錄
- **THEN** 系統 SHALL 令 `change` 為 0 且 `changePct` 為 0

#### Scenario: Hero 與四卡 freshness 同步降級
- **WHEN** Hero 缺失 `asOf` 或 freshness 驗證失敗
- **THEN** 四個統計卡 SHALL 同步進入非 ready 狀態
- **AND** 四卡不得維持與 Hero 不一致的 ready 顯示
