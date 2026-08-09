### Requirement: 受保護路由需要有效 token
系統 SHALL 在每次路由切換前檢查 `localStorage` 中是否存在 `token`。若目標路由的 `meta.requiresAuth` 為 `true` 且 token 不存在，系統 SHALL 中止導航並重導向至 `/login`。

#### Scenario: 無 token 存取受保護路由
- **WHEN** 使用者嘗試導航至 `meta.requiresAuth: true` 的路由，且 `localStorage` 中無 `token`
- **THEN** 系統停止導航並跳轉至 `/login`

#### Scenario: 有 token 存取受保護路由
- **WHEN** 使用者嘗試導航至 `meta.requiresAuth: true` 的路由，且 `localStorage` 中存在 `token`
- **THEN** 系統放行，正常完成導航至目標路由

### Requirement: 已登入使用者不得重複進入登入頁
系統 SHALL 在使用者已有 token 的情況下，自動將嘗試訪問 `/login` 的請求重導向至首頁 `/`。

#### Scenario: 有 token 訪問登入頁
- **WHEN** 使用者嘗試導航至 `/login`，且 `localStorage` 中存在 `token`
- **THEN** 系統跳轉至首頁 `/`

#### Scenario: 無 token 訪問登入頁
- **WHEN** 使用者嘗試導航至 `/login`，且 `localStorage` 中無 `token`
- **THEN** 系統放行，正常顯示登入頁面

### Requirement: 所有受保護路由標記 requiresAuth
系統的受保護頁面路由（除 `/login` 及其他公開路由外）SHALL 在路由設定中包含 `meta: { requiresAuth: true }`。

#### Scenario: 路由設定包含認證標記
- **WHEN** 開發者查閱 router/index.ts 中的受保護路由設定
- **THEN** 每個受保護路由均有 `meta.requiresAuth: true` 欄位
