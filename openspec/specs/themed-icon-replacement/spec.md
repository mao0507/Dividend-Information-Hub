# themed-icon-replacement Specification

## Purpose
TBD - created by archiving change replace-emoji-icons-with-themed-icons. Update Purpose after archive.
## Requirements
### Requirement: System SHALL replace emoji and inconsistent symbols with themed icons
系統 MUST 將 UI 中使用於功能表達的 emoji 與不一致字元符號替換為統一主題化 icon，並採一致來源與語意映射規則。

#### Scenario: Existing emoji/symbol icons are replaced in key UI areas
- **WHEN** 使用者開啟 Topbar、Sidebar、Dashboard、Alerts、Ranking、StockDetail 或 CommandPalette
- **THEN** 原本功能性 emoji/符號 MUST 被對應的主題 icon 取代
- **AND** 各頁面 icon 來源 MUST 維持一致

### Requirement: Themed icons SHALL preserve existing interactions and semantics
系統 MUST 確保 icon 替換不改變原本按鈕、導頁、切換與通知類型語意行為。

#### Scenario: Interactive icon behavior remains unchanged after replacement
- **WHEN** 使用者點擊已替換 icon 的互動控制項
- **THEN** 既有事件與路由行為 MUST 與替換前一致
- **AND** 不得因 icon 替換導致功能失效

### Requirement: Icon visual style SHALL remain consistent with project theme
系統 MUST 統一 icon 尺寸、顏色與互動狀態（hover/focus/disabled）以符合當前網頁主題，避免混用不同視覺語言。

#### Scenario: Icon style consistency validation
- **WHEN** 使用者在不同頁面檢視 icon
- **THEN** icon 尺寸與色彩 MUST 符合同一套主題規範
- **AND** 在深色背景下 MUST 保持可辨識性與可讀性

