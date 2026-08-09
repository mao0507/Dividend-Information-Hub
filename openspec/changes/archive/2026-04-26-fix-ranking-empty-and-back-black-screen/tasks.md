## 1. Ranking 空資料與錯誤狀態補強

- [x] 1.1 在 `RankingPage` 建立明確狀態（loading/ready/empty/error）並調整渲染條件
- [x] 1.2 實作空狀態 UI（含引導文案）與錯誤狀態 UI（含重試按鈕）
- [x] 1.3 確認篩選條件變動後可正確切換空狀態與正常列表狀態

## 2. 返回黑屏問題修復

- [x] 2.1 重現並定位 back navigation 黑屏根因（頁面狀態、layout、router guard）
- [x] 2.2 修正返回流程，確保主內容在返回後必定可渲染
- [x] 2.3 驗證 Dashboard ↔ Ranking ↔ StockDetail 往返不再出現黑屏

## 3. 測試與回歸驗收

- [x] 3.1 新增/更新測試：Ranking API 空資料時顯示空狀態
- [x] 3.2 新增/更新測試：Ranking API 失敗時顯示錯誤與可重試
- [x] 3.3 新增/更新 E2E：從 detail 返回前頁不黑屏，且路由切換正常
