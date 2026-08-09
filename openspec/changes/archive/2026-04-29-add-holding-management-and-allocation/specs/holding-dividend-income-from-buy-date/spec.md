## ADDED Requirements

### Requirement: 系統必須支援從買入時間起算已獲得除息收入
系統 MUST 以每筆 lot 的買入日期作為納入門檻，計算該 lot 對應股票在買入日之後且已確認入帳的現金股利，並累加為已獲得除息收入。

#### Scenario: lot 後有已入帳配息
- **WHEN** 某 lot 對應股票在 `buyDate` 之後存在 `filled=true` 且 `payDate` 可用的股利資料
- **THEN** 系統 SHALL 累加 `cash * lot.shares` 到該 lot 與該股票收入

#### Scenario: lot 後無已入帳配息
- **WHEN** 某 lot 建立後不存在符合條件的入帳股利
- **THEN** 系統 SHALL 將該 lot 已獲得除息收入視為 0

### Requirement: 系統必須輸出可彙總的除息收入結果
系統 MUST 同時回傳 lot 層級與股票彙總層級的已獲得除息收入，且總計 MUST 等於所有 lot 收入加總。

#### Scenario: 多筆 lot 對應同一股票
- **WHEN** 使用者同一股票有多筆 lot
- **THEN** 系統 SHALL 先計算每筆 lot 收入，再加總為該股票彙總收入

#### Scenario: 多檔股票總計
- **WHEN** 使用者持有多檔股票
- **THEN** 系統 SHALL 回傳跨股票總已獲得除息收入，且值等於各股票彙總收入總和
