## ADDED Requirements

### Requirement: 日期格溢出截斷
行事曆每個日期格 SHALL 最多顯示 2 筆除息事件。當該日除息事件超過 2 筆時，SHALL 在第 2 筆之後顯示 `+N 更多` 按鈕，N 為剩餘隱藏筆數。

#### Scenario: 超過 2 筆顯示溢出按鈕
- **WHEN** 某日有 3 筆以上除息事件
- **THEN** 日期格顯示前 2 筆事件
- **THEN** 顯示 `+N 更多` 按鈕，N = 總筆數 - 2

#### Scenario: 不超過 2 筆不顯示溢出按鈕
- **WHEN** 某日除息事件 <= 2 筆
- **THEN** 全部事件正常顯示
- **THEN** 不顯示 `+N 更多` 按鈕

### Requirement: 溢出 Dialog 展示完整清單
點擊 `+N 更多` 按鈕時 SHALL 彈出 Dialog，Dialog SHALL 包含標題（日期）及表格，表格 SHALL 列出該日所有除息事件。

#### Scenario: 點擊溢出按鈕開啟 Dialog
- **WHEN** 使用者點擊 `+N 更多` 按鈕
- **THEN** 彈出 Dialog，標題顯示該日期
- **THEN** Dialog 內表格列出所有除息股票

#### Scenario: Dialog 表格欄位
- **WHEN** Dialog 開啟
- **THEN** 表格包含三欄：代號、名稱、除息金額

#### Scenario: 尚未公布金額顯示
- **WHEN** 除息金額為 0（待公告）
- **THEN** 除息金額欄顯示「尚未公布」

#### Scenario: 關閉 Dialog
- **WHEN** 使用者點擊關閉按鈕或 Dialog 外部區域
- **THEN** Dialog 關閉，行事曆恢復正常
