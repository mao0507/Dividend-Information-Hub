## ADDED Requirements

### Requirement: Topbar action buttons must trigger defined behavior
系統 MUST 讓 Topbar 右上角每個 action 按鈕在點擊時觸發可預期行為，不得為空操作。

#### Scenario: User clicks any topbar action button
- **WHEN** 使用者點擊 Topbar 的任一 action 按鈕
- **THEN** 系統 MUST 執行該按鈕對應行為（導頁或功能觸發）
- **AND** 不可出現無回應狀態

### Requirement: Action-button navigation mapping must be consistent
系統 MUST 為每個按鈕定義固定導流目標，並在全站使用同一套映射。

#### Scenario: User clicks alert button
- **WHEN** 使用者點擊提醒按鈕
- **THEN** 系統 MUST 導向提醒中心頁（`/alerts`）

#### Scenario: User clicks settings button
- **WHEN** 使用者點擊設定按鈕
- **THEN** 系統 MUST 導向設定頁（`/settings`）

### Requirement: Action buttons must be accessible and testable
系統 MUST 提供可辨識的按鈕語意（例如 aria-label）以支援可及性與自動化測試。

#### Scenario: Assistive tech can identify action buttons
- **WHEN** 輔助工具或測試工具讀取 Topbar action 按鈕
- **THEN** 每個按鈕 MUST 有唯一且可理解的語意標記
