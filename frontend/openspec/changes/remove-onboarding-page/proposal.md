## Why

`Onboarding.vue` 最初設計為多步驟初始設定精靈，但目前功能尚未完整實作，且 `/login` 頁面已涵蓋所有認證入口需求。維持兩個入口（`/login` + `/onboarding`）增加路由邏輯複雜度，且 `/onboarding` 路由實際上與登入流程重疊，造成混淆。

## What Changes

- 刪除 `src/views/auth/Onboarding.vue`
- 移除 router 中的 `/onboarding` 路由定義
- 路由守衛未登入重導向改回 `/login`（原為 `/onboarding`）
- `Unauthorized.vue` 按鈕目標改回 `/login`
- 更新所有相關單元測試（`router/index.spec.ts`、`Unauthorized.spec.ts`）

## Capabilities

### New Capabilities
（無）

### Modified Capabilities
（無 spec 層級需求變更，僅實作清理）

## Impact

- `frontend/src/views/auth/Onboarding.vue` — 刪除
- `frontend/src/router/index.ts` — 移除路由、調整 guard 邏輯
- `frontend/src/views/auth/Unauthorized.vue` — 按鈕目標調整
- `frontend/src/router/index.spec.ts` — 更新測試 assertion
- `frontend/src/views/auth/Unauthorized.spec.ts` — 更新測試 assertion
