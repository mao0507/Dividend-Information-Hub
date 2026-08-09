## Context

前端使用 Vue 3 + Vue Router 4 + Pinia。目前路由設定集中在 `frontend/src/router/index.ts`，所有頁面路由均無認證守衛。JWT token 儲存於 `localStorage`（key: `token`）或 Pinia auth store。使用者若直接輸入受保護 URL，可在未登入狀態下進入頁面。

## Goals / Non-Goals

**Goals:**
- 在 Vue Router `beforeEach` 統一攔截未認證請求
- 以 `meta.requiresAuth` 標記受保護路由，避免侵入各個頁面元件
- 無 token 時清除殘留狀態並跳轉至 `/login`
- 已登入使用者訪問 `/login` 時自動導向首頁

**Non-Goals:**
- Token 有效性驗證（不向 API 驗證 token 是否過期，只做存在性檢查）
- 角色權限控制（RBAC）
- Refresh token 機制

## Decisions

### 決策 1：在 router/index.ts 內集中設置守衛，而非各頁面元件

**選擇**：全域 `beforeEach` 守衛  
**理由**：所有路由集中管理，單一責任，不需每個頁面自行處理重導向邏輯。若改為元件層攔截，則每個受保護頁面都要重複撰寫相同邏輯。

### 決策 2：以 `meta.requiresAuth` 標記路由

**選擇**：`meta.requiresAuth: true` 標記需認證路由  
**理由**：明確、可讀性高。相較於「白名單公開路由」方案，「黑名單」（預設公開，特定標記才需認證）更符合現有路由結構（登入頁公開，其餘皆需認證）。若未來需要更細粒度控制，可在 meta 加入額外欄位。

### 決策 3：token 存在性以 localStorage 直接讀取

**選擇**：`localStorage.getItem('token')` 作為認證依據  
**理由**：與現有 auth 實作一致，避免引入 Pinia store 的非同步初始化時序問題。若未來改用 store，只需修改守衛內的讀取來源。

## Risks / Trade-offs

- **[風險] Token 已過期但仍存在 localStorage** → 使用者可進入頁面，但 API 呼叫會返回 401。緩解：API 層攔截 401 並清除 token 後重導向（屬於後續優化，非本次範圍）。
- **[風險] 無限重導向迴圈** → `/login` 若誤設 `requiresAuth: true` 會導致死迴圈。緩解：守衛邏輯中明確排除目標為 `/login` 的情況，並在測試中驗證。
