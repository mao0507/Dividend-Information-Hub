## ADDED Requirements

### Requirement: Ranking page shall render explicit empty state
系統 MUST 在排行榜查詢結果為空時顯示明確空狀態，且告知使用者可調整篩選或重新查詢。

#### Scenario: Ranking API returns empty list
- **WHEN** 排行榜 API 成功回傳空資料
- **THEN** 頁面 MUST 顯示空狀態訊息
- **AND** 不可只呈現空白表格區塊

### Requirement: Ranking page shall render recoverable error state
系統 MUST 在排行榜載入失敗時顯示錯誤狀態，並提供可操作的重試入口。

#### Scenario: Ranking API request fails
- **WHEN** 排行榜 API 請求失敗（如 500/網路錯誤）
- **THEN** 頁面 MUST 顯示錯誤訊息
- **AND** 頁面 MUST 提供重試操作

### Requirement: Back navigation shall not produce black screen
系統 MUST 確保使用者從其他頁返回排行榜或前一頁時，主內容能正常渲染，不得出現黑屏。

#### Scenario: User navigates back from detail page
- **WHEN** 使用者由個股詳情頁返回排行榜或前一頁
- **THEN** 畫面 MUST 正常顯示頁面內容
- **AND** 不可出現全黑或無內容渲染狀態

### Requirement: Route transition fix shall preserve existing navigation
系統 MUST 在修復黑屏後維持既有有效路由可正常切換，不可引入新的導頁中斷。

#### Scenario: Navigate between dashboard and ranking
- **WHEN** 使用者在儀表板與排行榜間切換
- **THEN** 路由 MUST 正常運作
- **AND** 頁面狀態 MUST 可正確初始化與顯示
