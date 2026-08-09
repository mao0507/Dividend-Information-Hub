## Context

Dashboard 頂部目前有四個 KPI 卡（今日除息、本週除息、待填息、下次入帳），由 `KpiCard.vue` 元件渲染，資料來自 `dashboardTopCards.ts` 的 `buildDashboardTopCards()` 工具函式，驅動資料為後端 `/dashboard/summary` API 的 `DashboardSummary` 物件。這四張卡是純前端 UI 刪除，無需改動後端或 API 合約。

## Goals / Non-Goals

**Goals:**
- 從 Dashboard 頁面完整移除四卡 UI 與其專屬程式碼
- 刪除僅服務這四卡的死程式碼（`KpiCard.vue`、`dashboardTopCards.ts`、對應 spec 檔）
- 保持其餘 Dashboard 內容與測試不受影響

**Non-Goals:**
- 不修改後端 API 或 `DashboardSummary` 型別（欄位保留，前端停止消費即可）
- 不替換任何新卡片或 UI 元素（純刪除）
- 不修改其他頁面

## Decisions

**刪除整個 KpiCard 元件而非隱藏**
後端欄位不動，但前端元件與工具模組已無任何其他用途，保留會產生死程式碼。選擇直接刪除，讓 linter 在未來不再警告未使用的 import。

**不調整後端 DashboardSummary 型別**
`todayExDiv`、`weekExDiv`、`pendingFill`、`nextPayout` 欄位在後端仍可供未來功能使用。僅前端移除消費即可，避免跨層變更範圍擴大。

**同步刪除 spec 與測試**
`dashboardTopCards.spec.ts` 及 `Dashboard.spec.ts` 中的 KpiCard mock 若保留會形成無效測試；一併清除以維持測試集的信噪比。

## Risks / Trade-offs

- [風險] 若未來需要重新加入類似卡片，需重寫元件與工具 → 接受：需求已明確為「移除」，未來若有需要可從 git history 找回
- [風險] Dashboard.spec.ts 中的 KpiCard 測試斷言若遺漏，會造成未使用 mock 的 TypeScript 或 lint 警告 → 緩解：任務中明確列出需移除的每一個引用點

## Migration Plan

純前端刪除，無需資料庫 migration 或部署協調。步驟：
1. 刪除 `KpiCard.vue` 與 `dashboardTopCards.ts`（含 spec 檔）
2. 更新 `Dashboard.vue`（移除 import、computed、template 區塊）
3. 更新 `Dashboard.spec.ts`（移除 KpiCard mock 與斷言）
4. 執行 `pnpm build` + `pnpm test` 驗證
