## 1. 樣式常數更新

- [x] 1.1 在 `frontend/src/constants/form-control-styles.ts` 中新增 `themedSelectTriggerClass`（觸發器按鈕樣式）
- [x] 1.2 在 `frontend/src/constants/form-control-styles.ts` 中新增 `themedSelectListClass`（下拉清單容器樣式）
- [x] 1.3 在 `frontend/src/constants/form-control-styles.ts` 中新增 `themedSelectOptionClass`（選項 hover/active 樣式）
- [x] 1.4 移除 `themedSelectClass` 匯出（待 AlertsPage/SettingsPage 原生 select 遷移後執行）

## 2. USelect 元件重寫

- [x] 2.1 將 `<select>` / `<option>` 替換為 `<button>`（觸發器）+ `<ul>`/`<li>`（選項清單）
- [x] 2.2 加入 `isOpen` ref 控制清單展開/收合，點擊觸發器切換狀態
- [x] 2.3 加入 `focusIndex` ref，用於鍵盤高亮追蹤
- [x] 2.4 實作 `handleKeydown`：Enter/Space 展開、ArrowDown/ArrowUp 移動、Enter 確認選取、Escape 關閉
- [x] 2.5 實作 click outside 監聽（`onMounted` 加入 / `onUnmounted` 移除 `document` mousedown 事件）
- [x] 2.6 加入 ARIA 屬性：觸發器 `role="combobox"`、`aria-haspopup="listbox"`、`aria-expanded`；清單 `role="listbox"`；選項 `role="option"`、`aria-selected`

## 3. 驗證與清理

- [x] 3.1 確認所有使用 `<USelect>` 的頁面（DashboardPage、RankingPage、SettingsPage 等）正常顯示與操作
- [ ] 3.2 確認 TypeScript 編譯無錯誤（`tsc --noEmit`）
- [x] 3.3 更新 `USelect.spec.ts` 測試：移除針對 `<select>` 的測試，補充 div-based 互動測試
- [x] 3.4 確認 `themedSelectClass` 在整個 codebase 中無殘留引用
