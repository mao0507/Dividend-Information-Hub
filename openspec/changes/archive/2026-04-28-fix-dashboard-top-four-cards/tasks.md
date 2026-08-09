## 1. 資料契約與轉換層

- [x] 1.1 在前端定義四個統計區塊統一型別（title、displayValue、state、asOf）
- [x] 1.2 新增 Dashboard 四區塊資料映射函式，將 API raw payload 轉為統一 UI model
- [x] 1.3 實作缺值／過期／錯誤狀態轉換規則（`empty`、`stale`、`error`）並禁止缺值顯示 `0`

## 2. Dashboard 頁面整合

- [x] 2.1 在 `DashboardPage.vue` 改用新映射函式渲染上方四個統計區塊
- [x] 2.2 讓四區塊與 Hero 報價共用同一 `asOf` 與 freshness 判斷
- [x] 2.3 調整初載與手動刷新流程，確保四區塊與 Hero 的更新時機一致

## 3. 測試與驗收

- [x] 3.1 新增/更新 utility 單元測試：完整資料、部分缺漏、同步失敗三種情境
- [x] 3.2 新增/更新 Dashboard 頁面測試，驗證四區塊中性顯示與 Hero 同步降級行為
- [x] 3.3 手動驗證四個區塊在正常/缺值/過期狀態的畫面輸出與文案
