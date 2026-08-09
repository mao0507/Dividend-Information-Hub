## 1. 刪除死程式碼

- [x] 1.1 刪除 `src/views/dashboard/components/KpiCard.vue`
- [x] 1.2 刪除 `src/views/dashboard/utils/dashboardTopCards.ts`
- [x] 1.3 刪除 `src/views/dashboard/utils/dashboardTopCards.spec.ts`

## 2. 更新 Dashboard.vue

- [x] 2.1 移除 template 中 `<!-- KPI 4-card strip -->` 整個 `<div class="grid grid-cols-2 xl:grid-cols-4 gap-4">` 區塊
- [x] 2.2 移除 script 中 `import KpiCard from './components/KpiCard.vue'`
- [x] 2.3 移除 script 中 `import { buildDashboardTopCards, type DashboardTopCard, type DashboardCardState } from './utils/dashboardTopCards'`
- [x] 2.4 移除 `topSummaryCards` computed 屬性（`buildDashboardTopCards` 呼叫）
- [x] 2.5 將 `DashboardCardState` 型別改為在 script 內本地定義（`type DashboardCardState = 'ready' | 'empty' | 'stale' | 'error'`），因 `accumulatedIncomeState` 仍需此型別

## 3. 更新 Dashboard.spec.ts

- [x] 3.1 移除 `kpiCardStub` 變數定義（`name: 'KpiCard'`）
- [x] 3.2 移除所有 `global.stubs` 中的 `KpiCard: kpiCardStub` 引用（共 4 處）

## 4. 驗證

- [x] 4.1 執行 `pnpm build` 確認無 TypeScript/import 錯誤
- [x] 4.2 執行 `pnpm test` 確認所有測試通過
