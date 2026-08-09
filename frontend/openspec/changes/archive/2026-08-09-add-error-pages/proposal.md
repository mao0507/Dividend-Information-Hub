## Why

API 回傳 401（未授權）或 403（禁止存取）時，使用者目前看不到任何友善提示，體驗不佳且難以理解下一步操作。需要專屬錯誤頁面來說明問題並提供明確的「回到登入頁」動作。

## What Changes

- 新增 `UnauthorizedPage.vue`（401）：顯示「尚未登入或 session 已過期」提示，並附「回到登入頁」按鈕
- 新增 `ForbiddenPage.vue`（403）：顯示「您沒有存取此頁面的權限」提示，並附「回到登入頁」按鈕
- 在 Vue Router 新增 `/401` 與 `/403` 路由（公開路由，無需認證）
- 更新 `frontend/src/api/index.ts` 的 Axios 攔截器：401 refresh 失敗時導向 `/401`；新增 403 攔截導向 `/403`

## Capabilities

### New Capabilities

- `error-pages`: 401 與 403 錯誤頁面，提供友善說明與回到登入頁的按鈕

### Modified Capabilities

<!-- 無現有規格需異動 -->

## Impact

- **Frontend 新增**: `frontend/src/pages/UnauthorizedPage.vue`、`frontend/src/pages/ForbiddenPage.vue`
- **Router**: `frontend/src/router/index.ts`（新增 `/401`、`/403` 路由）
- **API 攔截器**: `frontend/src/api/index.ts`（更新 401 redirect、新增 403 redirect）
- **樣式**: 使用現有 Tailwind 色系，與 `NotFoundPage.vue` 視覺風格一致
