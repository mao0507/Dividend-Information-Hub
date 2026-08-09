## ADDED Requirements

### Requirement: Unknown route shall render Not Found page
系統 MUST 在使用者訪問未定義前端路由時，顯示一致的 404 Not Found 頁面，而非空白頁或無導引狀態。

#### Scenario: Navigate to unknown URL
- **WHEN** 使用者直接輸入不存在的網址（例如 `/foo/bar`）
- **THEN** 系統 MUST 顯示 404 頁面
- **AND** 頁面 MUST 包含可辨識的 Not Found 文案

### Requirement: Not Found page shall provide recovery actions
404 頁面 MUST 提供至少一個可恢復操作，讓使用者能返回有效流程；建議同時提供「回到儀表板」與「返回上一頁」。

#### Scenario: Return to dashboard from 404 page
- **WHEN** 使用者在 404 頁面點擊「回到儀表板」
- **THEN** 系統 MUST 導向 `/dashboard`

#### Scenario: Go back from 404 page
- **WHEN** 使用者在 404 頁面點擊「返回上一頁」
- **THEN** 系統 MUST 嘗試返回上一頁
- **AND** 若無可返回歷史，系統 MUST 導向 `/dashboard`

### Requirement: Catch-all route shall not break existing routes
系統 MUST 保證新增 catch-all 404 路由後，既有有效路由行為不被改變。

#### Scenario: Existing valid route still resolves
- **WHEN** 使用者訪問既有有效路由（例如 `/dashboard`）
- **THEN** 系統 MUST 照常載入對應頁面
- **AND** 不得誤導向 404
