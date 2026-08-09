# Proposal: migrate-to-primevue

## Problem

前端現有一套自製 `components/ui/` 原子元件層（UButton、UBadge、UChip、USelect、USlider、UToggle），以及對應的 `constants/form-control-styles.ts`。這些元件缺乏無障礙測試、鍵盤導航完整度不一，且每個元件皆需自行維護邏輯（例如 USelect 的 click-outside、ArrowKey 導航共 148 行）。

## Proposed Change

以 **PrimeVue 4（unstyled 模式）** 全面取代所有 U* 元件，採方案 B（頁面直接使用 PrimeVue 元件，U* 層完整刪除）。視覺風格維持不變，僅改變元件寫法與來源。

## Goals

- 移除 `components/ui/` 全部 6 個自製元件及 `constants/form-control-styles.ts`
- 以 PrimeVue unstyled + global Pass-through (PT) 配置集中管理所有元件樣式
- 頁面直接 import PrimeVue 元件（Button、Select、Chip、Slider、ToggleSwitch、Badge）
- 維持現有視覺設計：Tailwind 色票、CSS variable、字體、圓角等全部不動

## Non-Goals

- 不更動 chart/ 元件（lightweight-charts 相關）
- 不更動 layout/ 結構（AppLayout、AppSidebar、AppTopbar 等）
- 不更動 icons/ 系統（ThemedIcon）
- 不更動 style.css、tailwind.config.ts、CSS variables
- 不引入 PrimeVue 主題系統（維持 unstyled）

## Scope

影響 12 個檔案、53 個使用點：

| 元件 | PrimeVue 對應 | 使用點數 |
|------|--------------|---------|
| UButton | Button | 21 |
| UChip | Chip | 15 |
| USelect | Select | 8 |
| USlider | Slider（頁面展開 label/value） | 7 |
| UToggle | ToggleSwitch | 1 |
| UBadge | Badge | 1 |
