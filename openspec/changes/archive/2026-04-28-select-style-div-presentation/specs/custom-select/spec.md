## ADDED Requirements

### Requirement: 自訂下拉選單以 div 呈現
`USelect` 元件 SHALL 使用 `<button>` 作為觸發器、`<ul>` 作為選項清單，完全取代原生 `<select>` / `<option>` 元素，以實現完整的樣式控制。

#### Scenario: 初始渲染顯示目前選取值
- **WHEN** 元件掛載且 `modelValue` 已設定
- **THEN** 觸發器按鈕 SHALL 顯示對應 option 的 `label` 文字，選項清單 SHALL 為隱藏狀態

#### Scenario: 點擊觸發器展開清單
- **WHEN** 使用者點擊觸發器按鈕
- **THEN** 選項清單 SHALL 顯示，且觸發器的 `aria-expanded` SHALL 變為 `"true"`

#### Scenario: 點擊選項更新值並收合清單
- **WHEN** 使用者點擊某個選項
- **THEN** 元件 SHALL emit `update:modelValue` 傳出該選項的 `value`，並且清單 SHALL 收合

#### Scenario: 點擊外部區域關閉清單
- **WHEN** 清單展開中，使用者點擊元件外部任意位置
- **THEN** 選項清單 SHALL 收合

### Requirement: 鍵盤導航支援
`USelect` 元件 SHALL 支援基本鍵盤操作，讓使用者無需滑鼠即可完成選取。

#### Scenario: Enter 或 Space 鍵展開清單
- **WHEN** 觸發器按鈕獲得焦點，使用者按下 Enter 或 Space
- **THEN** 選項清單 SHALL 展開

#### Scenario: ArrowDown 移動焦點到下一個選項
- **WHEN** 清單展開中，使用者按下 ArrowDown
- **THEN** 高亮（focus index）SHALL 移動到下一個選項；若已在最後一項則停留

#### Scenario: ArrowUp 移動焦點到上一個選項
- **WHEN** 清單展開中，使用者按下 ArrowUp
- **THEN** 高亮（focus index）SHALL 移動到上一個選項；若已在第一項則停留

#### Scenario: Enter 鍵確認選取高亮選項
- **WHEN** 清單展開中且某選項被高亮，使用者按下 Enter
- **THEN** 元件 SHALL emit `update:modelValue` 傳出高亮選項的 `value`，並且清單 SHALL 收合

#### Scenario: Escape 鍵關閉清單
- **WHEN** 清單展開中，使用者按下 Escape
- **THEN** 選項清單 SHALL 收合，觸發器 SHALL 重新獲得焦點

### Requirement: ARIA 無障礙屬性
`USelect` 元件 SHALL 提供最低限度的 ARIA 屬性，使螢幕閱讀器能正確識別元件角色與狀態。

#### Scenario: 觸發器包含正確的 ARIA 屬性
- **WHEN** 元件渲染完成
- **THEN** 觸發器按鈕 SHALL 具備 `role="combobox"`、`aria-haspopup="listbox"` 及反映當前狀態的 `aria-expanded`

#### Scenario: 選項清單包含正確的 ARIA 屬性
- **WHEN** 選項清單渲染
- **THEN** `<ul>` SHALL 具備 `role="listbox"`，每個 `<li>` SHALL 具備 `role="option"` 及對應的 `aria-selected`
