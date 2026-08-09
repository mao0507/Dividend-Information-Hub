## Why

行事曆格子的日期 key 使用 `date.toISOString().slice(0, 10)` 計算，`toISOString()` 輸出 UTC 時間。在 UTC+8 時區，本地凌晨 `00:00` 轉換後變成前一天 `16:00 UTC`，導致 key 比實際日期少一天，除息事件顯示在錯誤的格子。

## What Changes

- `makeCell`：`key` 改用本地年/月/日字串拼接，不再呼叫 `toISOString()`
- `makeCell`：事件日期比對改為直接 `.slice(0, 10)` 取 ISO 字串前 10 碼，不再透過 `new Date()` 轉換
- `fmtDate`：解析日期改用字串切割（`split('-')`），避免 `new Date("YYYY-MM-DD")` 被解析為 UTC midnight 導致在地化顯示偏移

## Capabilities

### New Capabilities
（無）

### Modified Capabilities
（無 spec 層級需求變更，為 bug fix）

## Impact

- `frontend/src/views/calendar/Calendar.vue` — `makeCell`、`fmtDate` 函式
