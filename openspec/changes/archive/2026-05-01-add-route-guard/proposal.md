## Why

前端目前缺乏路由守衛機制，未登入（無有效 JWT token）的使用者可直接存取受保護頁面，造成安全漏洞與不佳的使用者體驗。需要在路由層統一攔截未授權請求，自動導向登入頁面。

## What Changes

- 新增 Vue Router 全域前置守衛（`beforeEach`），在每次路由切換前檢查 token 是否存在
- 區分「需要認證」的路由與「公開」路由（如登入頁）
- 無 token 時自動清除本地狀態並導向登入頁面
- token 存在時正常放行

## Capabilities

### New Capabilities

- `route-guard`: 路由守衛機制，檢查 JWT token 是否存在，未授權時重導向至登入頁面

### Modified Capabilities

<!-- 無現有規格需異動 -->

## Impact

- **Frontend**: `frontend/src/router/index.ts`（新增 beforeEach 守衛邏輯）
- **Auth Store**: 若使用 Pinia store 管理 token，需確保 store 提供清除 token 的方法
- **所有受保護路由**: 加上 `meta.requiresAuth: true` 標記
- **登入頁路由**: 加上 `meta.public: true` 或不設 requiresAuth，避免無限重導
