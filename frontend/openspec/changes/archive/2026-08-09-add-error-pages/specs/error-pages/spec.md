## ADDED Requirements

### Requirement: 401 未授權錯誤頁面
系統 SHALL 提供 `/401` 路由，顯示 `UnauthorizedPage.vue`，內容包含錯誤代碼標籤（「401」）、標題「尚未登入或 Session 已過期」、說明文字，以及「回到登入頁」按鈕。按鈕點擊後 SHALL 導向 `/onboarding`。此路由 SHALL 為公開路由（無需認證）。

#### Scenario: 訪問 /401 頁面
- **WHEN** 使用者訪問 `/401`
- **THEN** 頁面顯示錯誤代碼「401」、標題「尚未登入或 Session 已過期」、「回到登入頁」按鈕

#### Scenario: 點擊「回到登入頁」按鈕
- **WHEN** 使用者在 `/401` 頁面點擊「回到登入頁」按鈕
- **THEN** 系統導向 `/onboarding`

### Requirement: 403 禁止存取錯誤頁面
系統 SHALL 提供 `/403` 路由，顯示 `ForbiddenPage.vue`，內容包含錯誤代碼標籤（「403」）、標題「您沒有存取此頁面的權限」、說明文字，以及「回到登入頁」按鈕。按鈕點擊後 SHALL 導向 `/onboarding`。此路由 SHALL 為公開路由（無需認證）。

#### Scenario: 訪問 /403 頁面
- **WHEN** 使用者訪問 `/403`
- **THEN** 頁面顯示錯誤代碼「403」、標題「您沒有存取此頁面的權限」、「回到登入頁」按鈕

#### Scenario: 點擊「回到登入頁」按鈕
- **WHEN** 使用者在 `/403` 頁面點擊「回到登入頁」按鈕
- **THEN** 系統導向 `/onboarding`

### Requirement: API 攔截器自動導向錯誤頁面
系統 SHALL 在 Axios response 攔截器中處理 401 與 403 HTTP 狀態碼：
- 401 且 refresh token 失敗時，SHALL 導向 `/401`（取代原本的 `/onboarding` 硬跳轉）
- 403 時，SHALL 導向 `/403`

#### Scenario: API 回傳 401 且 refresh 失敗
- **WHEN** API 請求收到 401 回應，且 refresh token 請求亦失敗
- **THEN** 系統導向 `/401` 頁面

#### Scenario: API 回傳 403
- **WHEN** API 請求收到 403 回應
- **THEN** 系統導向 `/403` 頁面
