## Context

前端使用 Vue 3 + Vue Router 4。目前 `api/index.ts` 的 Axios 攔截器在 401 refresh 失敗後直接以 `window.location.href = '/onboarding'` 硬跳轉，不顯示任何錯誤說明。403 錯誤則完全未處理，使用者只會看到 API 請求靜默失敗。`NotFoundPage.vue` 已有完整的視覺設計規範（色系、圓角、間距），本次新頁面應延續相同風格。

## Goals / Non-Goals

**Goals:**
- 新增 `UnauthorizedPage.vue`（路由 `/401`）：顯示 session 過期說明 + 「回到登入頁」按鈕
- 新增 `ForbiddenPage.vue`（路由 `/403`）：顯示無存取權限說明 + 「回到登入頁」按鈕
- 更新 Axios 攔截器：401 refresh 失敗 → `/401`；403 → `/403`
- 兩個路由設為公開（`meta: { public: true }`），不需認證即可訪問

**Non-Goals:**
- 區分 401 的不同子情境（token 過期、從未登入）
- 伺服器端 403 錯誤詳情的傳遞
- 動畫或插圖
- i18n 多語系支援

## Decisions

### 決策 1：使用獨立路由頁面而非 Modal/Toast

**選擇**：`/401` 與 `/403` 各自對應一個全頁元件  
**理由**：全頁錯誤頁能清楚中斷操作流程、提供足夠空間說明問題，且與現有 `NotFoundPage` 模式一致。Modal 或 Toast 在頁面尚未完整渲染時可能無法正常顯示。

### 決策 2：Axios 攔截器使用 `router.push` 而非 `window.location.href`

**選擇**：改用 `router.push('/401')` / `router.push('/403')`  
**理由**：保留 Vue Router 的 SPA 導航歷史，使用者按「回到登入頁」後返回行為更可預期。`window.location.href` 會強制整頁重載，破壞 Pinia store 狀態。需在 `api/index.ts` 中引入 router 實例（或透過動態 import 避免循環依賴）。

### 決策 3：「回到登入頁」按鈕導向 `/onboarding`

**選擇**：按鈕 `router.push('/onboarding')`  
**理由**：`/onboarding` 是本應用的登入/註冊入口，與路由守衛的重導向目標一致，避免維護兩個「登入頁」概念。

## Risks / Trade-offs

- **[風險] api/index.ts 引入 router 造成循環依賴** → 以動態 `import('@/router')` 在攔截器 callback 內按需載入，避免模組初始化時期的循環。
- **[風險] 使用者在 /401 頁面重新整理後再按「回到登入頁」** → 因為是 SPA，重整後 history stack 清空，按鈕直接 push `/onboarding` 即可，不需回上一頁邏輯。
