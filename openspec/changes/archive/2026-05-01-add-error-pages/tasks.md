## 1. 新增錯誤頁面元件

- [ ] 1.1 建立 `frontend/src/pages/UnauthorizedPage.vue`（401），延續 NotFoundPage 視覺風格
- [ ] 1.2 建立 `frontend/src/pages/ForbiddenPage.vue`（403），延續 NotFoundPage 視覺風格
- [ ] 1.3 兩個頁面的「回到登入頁」按鈕皆導向 `/onboarding`

## 2. 路由設定

- [ ] 2.1 在 `frontend/src/router/index.ts` 新增 `/401` 路由（`UnauthorizedPage`，`meta: { public: true }`）
- [ ] 2.2 在 `frontend/src/router/index.ts` 新增 `/403` 路由（`ForbiddenPage`，`meta: { public: true }`）

## 3. API 攔截器更新

- [ ] 3.1 更新 `frontend/src/api/index.ts`：401 refresh 失敗時改用 `router.push('/401')` 取代 `window.location.href`
- [ ] 3.2 新增 403 攔截：收到 403 時以 `router.push('/403')` 導向

## 4. 單元測試

- [ ] 4.1 為 `UnauthorizedPage` 撰寫測試（顯示正確標題、點擊按鈕導向 `/onboarding`）
- [ ] 4.2 為 `ForbiddenPage` 撰寫測試（顯示正確標題、點擊按鈕導向 `/onboarding`）
- [ ] 4.3 確認所有測試通過
