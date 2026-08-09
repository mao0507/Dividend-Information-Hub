## 1. 路由設定更新

- [x] 1.1 在 `frontend/src/router/index.ts` 中為所有受保護路由加入 `meta: { requiresAuth: true }`
- [x] 1.2 確認 `/login` 路由未設置 `requiresAuth`（或明確設為 `false`）

## 2. 路由守衛實作

- [x] 2.1 在 `router/index.ts` 新增全域 `router.beforeEach` 守衛函式
- [x] 2.2 守衛內讀取 `localStorage.getItem('token')` 判斷是否已登入
- [x] 2.3 目標路由 `meta.requiresAuth` 為 `true` 且無 token 時，重導向至 `/login`
- [x] 2.4 目標路由為 `/login` 且已有 token 時，重導向至首頁 `/`

## 3. 單元測試

- [x] 3.1 為路由守衛撰寫單元測試（覆蓋：無 token 訪問保護路由、有 token 訪問保護路由、有 token 訪問登入頁、無 token 訪問登入頁）
- [x] 3.2 確認所有測試通過，覆蓋率 ≥ 80%

## 4. 驗收確認

- [ ] 4.1 手動測試：直接訪問受保護 URL（未登入），確認跳轉至 `/onboarding`
- [ ] 4.2 手動測試：登入後訪問 `/onboarding`，確認自動導向首頁
- [ ] 4.3 確認無無限重導向迴圈
