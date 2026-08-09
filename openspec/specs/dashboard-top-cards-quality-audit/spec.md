## REMOVED Requirements

### Requirement: 四個統計卡必須有一致且可驗證的狀態輸出
**Reason**: 儀表板頂部四卡（今日除息、本週除息、待填息、下次入帳）已從 UI 移除，對應的 `KpiCard.vue` 元件與 `buildDashboardTopCards()` 工具函式一併刪除。
**Migration**: 此能力不再需要。如需重新引入類似統計卡，應從 git history 重建，或設計全新的 Dashboard widget 系統。

### Requirement: 缺值、過期、錯誤三種狀態文案必須可區分
**Reason**: 同上，統計卡已移除，狀態文案規則不再適用。
**Migration**: 無。

### Requirement: 日期時間輸出必須可讀且不可直接顯示 ISO 原始格式
**Reason**: 同上，`formatReadableDate()` 輔助函式隨 `dashboardTopCards.ts` 一併刪除。
**Migration**: 如需日期格式化，請使用通用 `src/utils/` 層的工具函式。
