## 1. 建立新目錄結構

- [x] 1.1 建立 `src/plugins/`、`src/styles/` 目錄（空目錄）
- [x] 1.2 建立 `src/services/api/` 目錄（空目錄）
- [x] 1.3 建立 `src/views/` 及各 domain 子目錄：`dashboard/`, `calendar/`, `ranking/`, `alerts/`, `settings/`, `stock/`, `watchlist/`, `holdings/`, `drip/`, `viz/`, `auth/`

## 2. 移動 plugins

- [x] 2.1 將 `src/primevue-pt.ts` 移至 `src/plugins/primevue.ts`（export 名稱 `primevuePT` 不變）
- [x] 2.2 更新 `src/main.ts`：import 路徑 `'./primevue-pt'` → `'./plugins/primevue'`

## 3. 重組 services（原 api/）

- [x] 3.1 將 `src/api/index.ts`（axios 實例）複製為 `src/services/request.ts`
- [x] 3.2 將 `src/api/auth.ts` 移至 `src/services/api/auth.ts`，更新內部 `import api from '../index'` → `import api from '../request'`
- [x] 3.3 對 `alerts.ts`, `calendar.ts`, `dashboard.ts`, `drip.ts`, `holdings.ts`, `settings.ts`, `stock.ts`, `viz.ts`, `watchlist.ts` 重複步驟 3.2
- [x] 3.4 建立 `src/services/api/index.ts`：barrel export 所有 API 模組（`export * from './auth'` 等）
- [x] 3.5 刪除 `src/api/` 目錄（含所有原始檔案）

## 4. 移動頁面元件至 views/

- [x] 4.1 `src/pages/DashboardPage.vue` → `src/views/dashboard/Dashboard.vue`（含對應 spec 檔案）
- [x] 4.2 `src/pages/CalendarPage.vue` → `src/views/calendar/Calendar.vue`
- [x] 4.3 `src/pages/RankingPage.vue` → `src/views/ranking/Ranking.vue`（含 spec）
- [x] 4.4 `src/pages/AlertsPage.vue` → `src/views/alerts/Alerts.vue`（含 spec）
- [x] 4.5 `src/pages/SettingsPage.vue` → `src/views/settings/Settings.vue`（含 spec）
- [x] 4.6 `src/pages/StockDetailPage.vue` → `src/views/stock/StockDetail.vue`
- [x] 4.7 `src/pages/WatchlistPage.vue` → `src/views/watchlist/Watchlist.vue`
- [x] 4.8 `src/pages/HoldingsPage.vue` → `src/views/holdings/Holdings.vue`（含 spec）
- [x] 4.9 `src/pages/DripPage.vue` → `src/views/drip/Drip.vue`
- [x] 4.10 `src/pages/VizPage.vue` → `src/views/viz/Viz.vue`
- [x] 4.11 `src/pages/LoginPage.vue` → `src/views/auth/Login.vue`
- [x] 4.12 `src/pages/OnboardingPage.vue` → `src/views/auth/Onboarding.vue`
- [x] 4.13 `src/pages/NotFoundPage.vue` → `src/views/auth/NotFound.vue`（含 spec）
- [x] 4.14 `src/pages/UnauthorizedPage.vue` → `src/views/auth/Unauthorized.vue`（含 spec）
- [x] 4.15 `src/pages/ForbiddenPage.vue` → `src/views/auth/Forbidden.vue`（含 spec）
- [x] 4.16 刪除 `src/pages/` 目錄

## 5. 下放 domain 專用元件與工具

- [x] 5.1 建立 `src/views/dashboard/components/` 目錄，移入 `src/components/dashboard/KpiCard.vue`
- [x] 5.2 建立 `src/views/dashboard/utils/` 目錄，移入 `src/utils/dashboardTopCards.ts`（含 spec）
- [x] 5.3 刪除 `src/components/dashboard/` 目錄
- [x] 5.4 刪除 `src/components/HelloWorld.vue`

## 6. 移動全域樣式

- [x] 6.1 將 `src/style.css`（或 `src/assets/style.css`）移至 `src/styles/main.css`
- [x] 6.2 更新 `src/main.ts`：import `'./style.css'` → `'./styles/main.css'`

## 7. 更新 import 路徑

- [x] 7.1 更新 `src/router/index.ts`：所有 lazy import `@/pages/XxxPage` → `@/views/<domain>/Xxx`
- [x] 7.2 更新所有已移動的 view 元件內部：`from '@/api/...'` → `from '@/services/api/...'`
- [x] 7.3 更新 `src/views/dashboard/Dashboard.vue`：import `KpiCard` 路徑從 `@/components/dashboard/KpiCard` → `./components/KpiCard`
- [x] 7.4 更新 `src/views/dashboard/Dashboard.vue`：import `dashboardTopCards` 路徑 → `./utils/dashboardTopCards`

## 8. 更新測試 spec 檔案

- [x] 8.1 更新所有 `*.spec.ts` 的 import 路徑（`@/pages/` → `@/views/`，`@/api/` → `@/services/api/`）
- [x] 8.2 更新 `src/router/index.spec.ts` 的 mock 路徑

## 9. 驗證

- [x] 9.1 執行 `pnpm build` 確認無 import 錯誤
- [x] 9.2 執行 `pnpm test` 確認全部測試通過
- [ ] 9.3 啟動 `pnpm dev`，手動驗證路由可正常切換每個頁面
