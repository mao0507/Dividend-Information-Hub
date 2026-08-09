## Why

行事曆格子的事件晶片僅顯示股票代號與名稱，配息金額 `ev.amount.toFixed(1)` 雖已存在於 template，但在 `text-[9px]` + `truncate` 的極小容器中容易被截斷；若資料庫 `cash` 欄位為 0，使用者看不到任何有效金額，無法判斷除息價值。

## What Changes

- `Calendar.vue`：確保事件晶片永遠顯示配息金額，且不因 `truncate` 被裁切
  - 調整晶片 layout：移除外容器的 `truncate`，改讓股票名稱 `truncate`
  - 配息金額加單位標示（如 `$1.2`）並提升字重可讀性
- `Calendar.vue`：當 `amount === 0` 時晶片顯示 `—` 而非 `0.0`，避免誤導

## Capabilities

### New Capabilities
（無）

### Modified Capabilities
（無 spec 層級需求變更，為 bug fix / UX 微調）

## Impact

- `frontend/src/views/calendar/Calendar.vue` — 事件晶片 template（第 122–141 行）
