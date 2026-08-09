## Why

目前前端路由未定義 404 錯誤頁，使用者進入不存在的網址時缺少明確回饋與導引，容易造成迷失與跳出。需要補齊標準 Not Found 體驗，讓錯誤路徑可回到有效流程。

## What Changes

- 新增前端 404 頁面（Not Found）並提供明確文案與返回入口。
- 在 Vue Router 加入 catch-all 路由，將未知路徑導向 404 頁面。
- 提供主要導引動作（返回儀表板、回上一頁）。
- 將 404 頁面納入基本測試驗收（路由導向與按鈕行為）。

## Capabilities

### New Capabilities
- `not-found-page`: 提供一致的 404 錯誤頁與未知路由導流機制。

### Modified Capabilities
- 無

## Impact

- 影響程式：
  - `frontend/src/router/index.ts`
  - `frontend/src/pages/NotFoundPage.vue`（新增）
  - 可能包含對應測試檔
- 影響系統：前端路由 UX 與錯誤導流體驗。
- 相依：無新增第三方套件需求。
