# dashboard-hero-quote-accuracy Specification

## Purpose
修正 Dashboard Hero 個股報價在漲跌幅計算上的基準價錯誤，確保 API 回傳數值可驗證且不誤導使用者。

## Requirements
### Requirement: Hero 報價漲跌幅須有可驗證之基準價
對外提供之個股詳情 API（含儀表板 Hero 所用之同一資料來源）在回傳 `change` 與 `changePct` 時 MUST 使用同一檔股票於資料庫中「最新收盤價之前一筆交易日收盤價」為基準；若不存在該基準（例如僅有一筆價格紀錄），則 MUST 將漲跌額與漲跌幅設為零，不得回傳基於無效基準計算之百分比。Dashboard 顯示 Hero 報價時 MUST 與上方四個統計區塊共用同一 `asOf` 與 freshness 判斷，避免同頁資訊時間基準不一致。

#### Scenario: 至少兩筆歷史收盤價且 asOf 一致
- **WHEN** 該股票於資料庫中存在至少兩筆依日期排序之收盤價紀錄，且 Dashboard 可取得有效 `asOf`
- **THEN** 系統 SHALL 以最新收盤價減去前一交易日收盤價計算 `change`，並以該前一交易日收盤價為分母計算 `changePct`，且 SHALL 以同一 `asOf` 提供 Hero 與四個統計區塊

#### Scenario: 僅一筆收盤價
- **WHEN** 該股票僅存在一筆收盤價紀錄
- **THEN** 系統 SHALL 令 `change` 為 0 且 `changePct` 為 0

#### Scenario: asOf 缺漏或 freshness 驗證失敗
- **WHEN** Hero 報價無法取得可用 `asOf` 或 freshness 驗證失敗
- **THEN** 系統 SHALL 令 Hero 與四個統計區塊同步採用中性顯示，不得讓 Hero 單獨顯示為 ready

### Requirement: 禁止對使用者展示明顯不合理之漲跌幅
系統 MUST 避免在正常使用情境下回傳明顯不合理之 `changePct`（例如僅因種子資料或查詢錯誤導致之極端百分比）；若偵測到資料異常，MUST 改以零漲跌幅或產品約定之中性表示，並不得與「僅一筆價格」規則相衝突。

#### Scenario: 異常比值被抑制
- **WHEN** 依基準價計得之漲跌幅絕對值超過系統約定之上限（用以隔離種子／資料錯誤）
- **THEN** 系統 SHALL 不對客戶端回傳該異常百分比，並 SHALL 改採約定之中性數值（與實作一致）
