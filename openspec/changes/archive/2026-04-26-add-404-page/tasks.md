## 1. 路由與頁面建立

- [x] 1.1 新增 `frontend/src/pages/NotFoundPage.vue`，包含 404 文案與兩個導引動作按鈕
- [x] 1.2 在 `frontend/src/router/index.ts` 新增 catch-all 路由 `/:pathMatch(.*)*` 並導向 NotFoundPage
- [x] 1.3 確認 404 route 不會影響現有有效路由載入（例如 `/dashboard`、`/watchlist`）

## 2. 行為驗證與回歸保護

- [x] 2.1 實作「回到儀表板」按鈕導向邏輯
- [x] 2.2 實作「返回上一頁」邏輯與無歷史時 fallback 至 `/dashboard`
- [x] 2.3 新增或更新前端測試，驗證未知路徑會顯示 404 且兩個動作可用
