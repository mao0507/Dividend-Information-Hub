## Why

行事曆「僅自選股」篩選器點選後無效果，顯示結果與未啟用時相同。根因為前端 `watch` 對 `filters.value.watchlistOnly` 變更偵測正常，但後端 `userId` 來自 JWT 解析，若 JWT payload 的 `sub` 欄位未正確對應 `User.id`，`watchlistItem.findMany` 查不到任何資料，導致 `watchlistSet` 為空、`stockCode IN ()` 回傳零筆或完全無篩選效果。此外，前端在自選股清單為空時沒有任何提示，使用者無從判斷是資料問題還是程式問題。

## What Changes

- 確認 JWT guard 將正確的 `userId` 注入 `req.user.id`
- Calendar service `getMonthEvents`：若 `watchlistOnly=true` 但 `watchlistSet` 為空，回傳空陣列（正確行為）並加上 logger warning
- 前端：啟用「僅自選股」且結果為空時，顯示「自選股清單為空」提示，而非空白行事曆

## Capabilities

### New Capabilities

（無）

### Modified Capabilities

- `calendar-watchlist-filter`：watchlistOnly 篩選須在自選股為空時給予前端明確訊號

## Impact

- `backend/src/calendar/calendar.service.ts`：加 logger warning
- `backend/src/common/guards/jwt-auth.guard.ts`：確認 userId 注入
- `frontend/src/views/calendar/Calendar.vue`：空自選股提示
