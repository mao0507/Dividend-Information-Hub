## Why

目前專案仍混用 emoji、特殊符號與少量文字 icon，視覺語言不一致，且在不同平台渲染風格差異大，會破壞整體主題一致性。現在進行統一替換，可在後續功能擴充時維持一致的品牌觀感與可維護性。

## What Changes

- 以單一 icon 來源（參照 Icônes 生態）建立專案圖示選型規則，替換現有 emoji 與不一致符號。
- 建立 icon 對照表（舊符號 -> 新 icon），覆蓋 Topbar、Sidebar、Dashboard、Alerts、Ranking、StockDetail、CommandPalette 等主要 UI。
- 統一 icon 尺寸、顏色、hover/focus 狀態，確保在深色主題下可讀性一致。
- 對可互動 icon 補齊可存取屬性（如 aria-label）與測試驗收點，避免僅外觀替換而回歸功能。

## Capabilities

### New Capabilities
- `themed-icon-replacement`: 將專案內 emoji/非主題 icon 全面替換為一致的主題化 icon 系統。

### Modified Capabilities
無

## Impact

- 預期影響檔案：
  - `frontend/src/components/layout/AppTopbar.vue`
  - `frontend/src/components/layout/AppSidebar.vue`
  - `frontend/src/components/layout/CommandPalette.vue`
  - `frontend/src/pages/AlertsPage.vue`
  - `frontend/src/pages/DashboardPage.vue`
  - `frontend/src/pages/RankingPage.vue`
  - `frontend/src/pages/StockDetailPage.vue`
  - `frontend/src/components/ui/USelect.vue`
- 可能需要新增 icon 資源封裝檔（例如 `frontend/src/components/icons/*` 或 `frontend/src/constants/icons.ts`）。
- 不影響後端 API，不涉及資料模型變更。
