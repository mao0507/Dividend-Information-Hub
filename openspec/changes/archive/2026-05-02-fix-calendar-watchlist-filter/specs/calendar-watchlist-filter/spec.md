## ADDED Requirements

### Requirement: 僅自選股篩選器正確觸發載入
啟用「僅自選股」開關時 SHALL 立即重新載入行事曆資料，僅顯示自選股的除息事件。

#### Scenario: 啟用篩選器觸發重新載入
- **WHEN** 使用者點擊「僅自選股」ToggleSwitch 使其變為 ON
- **THEN** 行事曆立即重新載入
- **THEN** 顯示結果僅包含自選股清單內的股票

#### Scenario: 關閉篩選器恢復完整清單
- **WHEN** 使用者將「僅自選股」ToggleSwitch 切換回 OFF
- **THEN** 行事曆重新載入
- **THEN** 顯示所有符合其他篩選條件的除息事件

### Requirement: 自選股為空時顯示提示
啟用「僅自選股」篩選器且使用者自選股清單為空時，SHALL 顯示提示訊息，引導使用者前往新增自選股。

#### Scenario: 自選股清單為空的提示
- **WHEN** 啟用「僅自選股」且行事曆無任何事件（自選股清單為空）
- **THEN** 主內容區顯示「自選股清單為空」提示
- **THEN** 提示包含「前往新增」連結，導向 /watchlist
