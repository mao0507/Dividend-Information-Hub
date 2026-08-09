## ADDED Requirements

### Requirement: 每日自動計算填息狀態
系統 SHALL 在每日股價同步完成後，掃描所有 `filled=false` 且 `exDate <= 今日` 的 `Dividend` 紀錄，比對除息後每日收盤價是否回到除息前收盤（`preExClose`），並回寫 `filled` 與 `fillDays`。

#### Scenario: 股價回到除息前水準時標記填息
- **WHEN** `DividendFillTrackerService` 處理某筆 `filled=false` 的配息紀錄，且 exDate 後某交易日收盤價 >= `preExClose`
- **THEN** 系統 SHALL 將該 `Dividend` 的 `filled` 設為 `true`，`fillDays` 設為從 `exDate` 至填息日的交易日數（不含 exDate 當日）

#### Scenario: 尚未填息的紀錄保持 filled=false
- **WHEN** 追蹤期間所有交易日收盤均低於 `preExClose`
- **THEN** 系統 SHALL 保持 `filled=false`，`fillDays` 維持 `null`，下次執行時繼續追蹤

#### Scenario: preExClose 缺失時跳過計算
- **WHEN** 某筆配息紀錄的 `preExClose` 為 `null`（舊資料或資料不完整）
- **THEN** 系統 SHALL 跳過該筆計算，log 含股票代號與 exDate，不標記 error

#### Scenario: StockPrice 資料不足時不誤判
- **WHEN** exDate 後的 `StockPrice` 在 DB 中尚無紀錄（例如當日股價尚未同步）
- **THEN** 系統 SHALL 視為未填息，保持 `filled=false`，不因資料缺漏做出錯誤判斷

### Requirement: Dividend 資料表新增 preExClose 欄位
系統 SHALL 在 `Dividend` 資料表新增 `preExClose Float?` 欄位，儲存 TWT49U 提供的除息前收盤價，作為填息判斷基準。

#### Scenario: 回填時寫入 preExClose
- **WHEN** `DividendHistoryBackfillService` 或 `DividendSyncService` 寫入 `Dividend` 紀錄
- **THEN** 若來源資料含有除息前收盤價，系統 SHALL 將其寫入 `Dividend.preExClose`

#### Scenario: 現有紀錄缺少 preExClose 不影響其他欄位
- **WHEN** 現有 `Dividend` 紀錄的 `preExClose` 為 `null`
- **THEN** 其他欄位（`cash`、`exDate`、`filled`、`fillDays`）正常運作，系統不報錯
