## Context

`USelect.vue` 目前使用原生 `<select>` 元素搭配 `appearance-none` 來套用設計系統樣式。  
由於各瀏覽器對原生 select 的渲染方式不一致（尤其是 Windows Chrome / Safari / Firefox），  
下拉箭頭、option 清單的背景色、字型等無法完全受控。  
現行的 `themedSelectClass` 包含大量 hack（`appearance-none`、`bg-surface-2` on option），  
維護成本高且視覺效果仍有落差。

專案使用 Vue 3 + Composition API + Tailwind CSS，無引入 headlessui 或 radix-vue 等 headless 函式庫。

## Goals / Non-Goals

**Goals:**
- 以 `<div>` + `<ul>` 取代 `<select>` / `<option>`，完整掌控樣式
- 維持現有 `modelValue` / `options` props 及 `update:modelValue` emit 介面（零破壞性）
- 支援基本鍵盤導航：Enter/Space 展開、ArrowUp/ArrowDown 切換選項、Escape 關閉
- 加入 ARIA 屬性（`role="combobox"`、`aria-expanded`、`aria-activedescendant`）
- Click outside 自動關閉

**Non-Goals:**
- 多選（multi-select）
- 搜尋過濾（searchable dropdown）
- 虛擬捲動（大量選項效能優化）
- 動畫過場（transition）— 可後續疊加

## Decisions

### 決策 1：不引入外部 headless 函式庫

**選項：**
- A) 自行實作（採用）
- B) 引入 `@headlessui/vue` 或 `radix-vue`

**理由：**  
USelect 是小型內部元件，目前 option 數量少（< 20）。  
引入外部函式庫會增加 bundle size 並帶來版本鎖定風險，且需學習新 API。  
自行實作在本案規模內完全可控。

---

### 決策 2：觸發器使用 `<button>` 而非 `<div>`

**選項：**
- A) `<button>` 作為觸發器（採用）
- B) `<div tabindex="0">` 作為觸發器

**理由：**  
`<button>` 原生具備鍵盤焦點、`type="button"` 防止表單 submit，且螢幕閱讀器語意正確。

---

### 決策 3：選項清單使用 fixed 定位

**選項：**
- A) `position: absolute`（相對父容器）
- B) `position: fixed`（相對 viewport）

**理由：**  
Topbar 等容器可能有 `overflow: hidden`，absolute 清單會被裁切。  
fixed 可確保清單永遠顯示在最上層，但需在 `onMounted` / resize 時重新計算座標。  
考量目前使用場景（Topbar 右上角選單），採用 **absolute** 即可，因父容器無裁切問題；  
若日後遇到裁切問題可改為 fixed + Teleport。

---

### 決策 4：樣式常數拆分

移除 `themedSelectClass`，新增：
- `themedSelectTriggerClass`：觸發器按鈕樣式
- `themedSelectOptionClass`：每個選項的樣式
- `themedSelectListClass`：下拉清單容器樣式

## Risks / Trade-offs

| 風險 | 緩解措施 |
|------|---------|
| Click outside 監聽器洩漏 | 在 `onUnmounted` 移除 `document` 事件監聽 |
| 鍵盤導航焦點管理複雜度 | 僅實作最小鍵盤支援（Enter/Arrow/Escape），不做 typeahead |
| ARIA 不完整導致無障礙問題 | 加入 `role="combobox"`、`aria-expanded`、`aria-haspopup="listbox"` 最低限度屬性 |
| 原生 select 在行動裝置體驗較佳 | 本專案為桌面端優先應用，可接受此取捨 |

## Migration Plan

1. 修改 `USelect.vue` — 以 div/ul 取代 select/option
2. 修改 `form-control-styles.ts` — 新增三個新常數，移除 `themedSelectClass`
3. 確認所有使用 `<USelect>` 的頁面正常運作（props/emit 介面不變）
4. 移除 `themedSelectClass` 的所有引用

**回滾策略：** git revert 單一 commit 即可，無資料庫 migration。
