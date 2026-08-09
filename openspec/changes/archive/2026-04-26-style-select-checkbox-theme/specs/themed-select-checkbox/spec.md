## ADDED Requirements

### Requirement: Select controls SHALL follow theme visual tokens
系統 MUST 讓所有納入範圍的 `select` 控制項使用一致主題樣式，包含背景、邊框、文字、hover 與 focus-visible 狀態，不得出現與頁面主題衝突的預設瀏覽器外觀。

#### Scenario: Themed select renders in settings and alerts pages
- **WHEN** 使用者進入包含 `select` 控制項的設定頁與提醒頁
- **THEN** `select` MUST 套用主題化樣式（surface/border/content/accent）
- **AND** `select` MUST 在 hover 與 focus-visible 呈現可辨識互動狀態

### Requirement: Checkbox controls SHALL provide clear checked and focus states
系統 MUST 讓納入範圍的 `checkbox` 在未勾選、已勾選、focus-visible、disabled 狀態下皆有可辨識的主題化表現，且勾選狀態不可與背景混淆。

#### Scenario: Themed checkbox state transitions are visible
- **WHEN** 使用者切換 `checkbox` 勾選狀態或以鍵盤聚焦控制項
- **THEN** 畫面 MUST 顯示清楚的 checked 樣式與 focus-visible 樣式
- **AND** disabled 狀態 MUST 與可互動狀態明確區分

### Requirement: Style standardization SHALL not alter form behavior
系統 MUST 在樣式統一後維持既有表單值綁定、變更事件與提交邏輯，不得改變業務功能。

#### Scenario: Existing form interaction remains intact after style update
- **WHEN** 使用者在套用新樣式後操作 `select` 與 `checkbox`
- **THEN** 原有資料綁定與 API 觸發行為 MUST 與變更前一致
- **AND** 不得新增導頁錯誤或互動中斷
