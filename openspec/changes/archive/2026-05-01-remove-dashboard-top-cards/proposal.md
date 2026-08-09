## Why

儀表板頂部的四張 KPI 小卡（今日除息、本週除息、待填息、下次入帳）呈現的是市場層面的統計數字，與使用者的個人持股關聯性薄弱，且佔用了顯眼的版面空間；移除後可讓儀表板聚焦在更有價值的個人化資訊。

## What Changes

- **移除** Dashboard 頂部 `grid grid-cols-2 xl:grid-cols-4` 區塊（`KpiCard` v-for 迴圈）
- **刪除** `src/views/dashboard/components/KpiCard.vue` 元件
- **刪除** `src/views/dashboard/utils/dashboardTopCards.ts` 工具模組（含型別、`buildDashboardTopCards`）
- **刪除** `src/views/dashboard/utils/dashboardTopCards.spec.ts` 測試檔
- **移除** `Dashboard.vue` 中對 `KpiCard`、`dashboardTopCards` 的所有 import 與 computed 引用
- **移除** `Dashboard.spec.ts` 中對 KPI 卡的所有斷言

## Capabilities

### New Capabilities

（無新增能力）

### Modified Capabilities

- `dashboard-top-cards-quality-audit`: 四張頂部卡片規格已廢棄，對應 spec 需標記為 REMOVED

## Impact

- `frontend/src/views/dashboard/Dashboard.vue` — 移除 KPI 卡區塊與相關 imports / computed
- `frontend/src/views/dashboard/components/KpiCard.vue` — 整個檔案刪除
- `frontend/src/views/dashboard/utils/dashboardTopCards.ts` — 整個檔案刪除
- `frontend/src/views/dashboard/utils/dashboardTopCards.spec.ts` — 整個檔案刪除
- `frontend/src/views/dashboard/Dashboard.spec.ts` — 移除 KpiCard mock 與相關測試斷言
- 後端 `DashboardSummary` 型別中的 `todayExDiv`、`weekExDiv`、`pendingFill`、`nextPayout` 欄位仍保留（不改動 API），僅前端停止消費
