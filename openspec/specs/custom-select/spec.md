# custom-select Specification

## Purpose
以 PrimeVue `<Select>` 元件取代原有自訂 `USelect` wrapper，實現完整樣式控制（透過 Pass-through / PT）、鍵盤導航與 ARIA 無障礙屬性。

## Requirements
### Requirement: 下拉選單顯示目前選取值
應用程式使用的下拉選單 SHALL 正確顯示當前選取值，並在使用者互動後更新。

#### Scenario: 初始渲染顯示目前選取值
- **WHEN** 元件掛載且 `modelValue` 已設定
- **THEN** 觸發器 SHALL 顯示對應 option 的 `label` 文字，選項清單 SHALL 為隱藏狀態

#### Scenario: 點擊觸發器展開清單
- **WHEN** 使用者點擊觸發器
- **THEN** 選項清單 SHALL 顯示

#### Scenario: 點擊選項更新值並收合清單
- **WHEN** 使用者點擊某個選項
- **THEN** 元件 SHALL emit `update:modelValue` 傳出該選項的 `value`，並且清單 SHALL 收合

#### Scenario: 點擊外部區域關閉清單
- **WHEN** 清單展開中，使用者點擊元件外部任意位置
- **THEN** 選項清單 SHALL 收合

### Requirement: 鍵盤導航支援
下拉選單 SHALL 支援基本鍵盤操作，讓使用者無需滑鼠即可完成選取。

#### Scenario: Enter 或 Space 鍵展開清單
- **WHEN** 觸發器獲得焦點，使用者按下 Enter 或 Space
- **THEN** 選項清單 SHALL 展開

#### Scenario: ArrowDown / ArrowUp 移動焦點
- **WHEN** 清單展開中，使用者按下 ArrowDown 或 ArrowUp
- **THEN** 高亮項目 SHALL 依方向移動；邊界時停留

#### Scenario: Enter 鍵確認選取
- **WHEN** 清單展開中且某選項被高亮，使用者按下 Enter
- **THEN** 元件 SHALL emit `update:modelValue` 傳出高亮選項的 `value`，並且清單 SHALL 收合

#### Scenario: Escape 鍵關閉清單
- **WHEN** 清單展開中，使用者按下 Escape
- **THEN** 選項清單 SHALL 收合，觸發器 SHALL 重新獲得焦點

### Requirement: ARIA 無障礙屬性
下拉選單 SHALL 提供最低限度的 ARIA 屬性，使螢幕閱讀器能正確識別元件角色與狀態。

#### Scenario: 觸發器包含正確的 ARIA 屬性
- **WHEN** 元件渲染完成
- **THEN** 觸發器 SHALL 具備 `role="combobox"`、`aria-haspopup="listbox"` 及反映當前狀態的 `aria-expanded`

#### Scenario: 選項清單包含正確的 ARIA 屬性
- **WHEN** 選項清單渲染
- **THEN** 清單容器 SHALL 具備 `role="listbox"`，每個選項 SHALL 具備 `role="option"` 及對應的 `aria-selected`
