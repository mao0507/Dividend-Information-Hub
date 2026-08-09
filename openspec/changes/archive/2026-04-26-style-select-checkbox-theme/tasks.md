## 1. 主題樣式基礎整理

- [x] 1.1 盤點現有 `select` 與 `checkbox` 使用點（`SettingsPage`、`AlertsPage`、`USelect`）並確認需統一的狀態樣式
- [x] 1.2 建立 `select` 與 `checkbox` 共用主題樣式（default/hover/focus-visible/disabled/checked）

## 2. 頁面套用與驗收

- [x] 2.1 將主題樣式套用到 `SettingsPage` 與 `AlertsPage` 的 `select` 與 `checkbox`
- [x] 2.2 確認套用後不影響原有 `v-model`、事件觸發與 API 行為

## 3. 測試與回歸

- [x] 3.1 新增或更新測試，驗證 `select`/`checkbox` 主題 class 與狀態呈現
- [x] 3.2 手動驗證 hover、focus、checked、disabled 狀態在主要頁面顯示一致且可讀
