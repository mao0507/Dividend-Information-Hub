## Why

原生 `<select>` 元素在各瀏覽器的外觀差異大，且 `appearance-none` 的視覺覆蓋能力有限，無法完全套用設計系統的 token（如圓角、字型、hover 特效等）。改以 `<div>` 為基礎的自訂下拉選單，可完全掌控樣式，確保 UI 一致性並支援未來的動畫與進階互動。

## What Changes

- **移除** `USelect.vue` 中的 `<select>` / `<option>` 原生標籤
- **新增** 以 `<div>` + `<ul>` 實作的自訂下拉選單，包含觸發器按鈕（trigger）與選項清單（dropdown list）
- **移除** `frontend/src/constants/form-control-styles.ts` 中的 `themedSelectClass`（不再需要 `appearance-none` hack）
- **新增** `themedSelectTriggerClass` 與 `themedSelectOptionClass` 常數供新元件使用
- 支援鍵盤導航（Enter / Space 展開、Arrow Up/Down 切換、Escape 關閉）
- 維持現有的 `modelValue` / `options` props 及 `update:modelValue` emit 介面，零破壞性更動

## Capabilities

### New Capabilities

- `custom-select`: 以純 div/ul 實作的自訂下拉選單元件，完整支援樣式控制、鍵盤導航與無障礙屬性（ARIA）

### Modified Capabilities

<!-- 無既有 spec 需要修改 -->

## Impact

- **檔案**: `frontend/src/components/ui/USelect.vue`、`frontend/src/constants/form-control-styles.ts`
- **依賴元件**: 所有使用 `<USelect>` 的頁面（DashboardPage、RankingPage、SettingsPage 等）— props/emit 介面不變，無需修改
- **無破壞性變更**：外部 API 完全相容
