## 1. 移除 Onboarding 元件與路由

- [x] 1.1 刪除 `frontend/src/views/auth/Onboarding.vue`
- [x] 1.2 移除 `frontend/src/router/index.ts` 中的 `/onboarding` 路由定義
- [x] 1.3 路由守衛 `beforeEach` 中將 `to.name === 'onboarding'` 條件移除（已登入判斷僅保留 `to.name === 'login'`）
- [x] 1.4 路由守衛未登入重導向改回 `/login`（從 `/onboarding`）
- [x] 1.5 更新 JSDoc 註解，移除 `/onboarding` 相關說明

## 2. 更新 Unauthorized 頁面

- [x] 2.1 `frontend/src/views/auth/Unauthorized.vue`：`goLogin` 函式改為 `router.push('/login')`
- [x] 2.2 更新 JSDoc 註解描述

## 3. 更新單元測試

- [x] 3.1 `frontend/src/router/index.spec.ts`：所有重導向至 `/onboarding` 的 assertion 改為 `/login`
- [x] 3.2 移除「已登入訪問 /onboarding」與「未登入訪問 /onboarding」兩個測試案例
- [x] 3.3 將「不會因 /onboarding ↔ 受保護路由產生無限重導向」改為 `/login`
- [x] 3.4 `frontend/src/views/auth/Unauthorized.spec.ts`：路由 stub 與 assertion 改回 `/login`

## 4. 驗收

- [x] 4.1 執行 `pnpm test` 確認所有測試通過
- [ ] 4.2 手動驗證：未登入訪問 `/dashboard`，確認跳轉至 `/login`
