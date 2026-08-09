## 1. Dashboard Card Merge

- [x] 1.1 調整 `DashboardPage`，將累積股息收入與總投資金額整合為單一卡片容器
- [x] 1.2 移除舊有兩個分離區塊，避免重複顯示相同資訊
- [x] 1.3 在合併卡片中保留累積股息收入狀態文案（ready/empty/stale/error）與 as-of 顯示

## 2. UI Consistency and Navigation

- [x] 2.1 調整合併卡片的字級與排列層級，確保主次資訊清晰可讀
- [x] 2.2 保留並驗證「前往持股管理」入口在合併後仍可正常使用

## 3. Test and Verification

- [x] 3.1 更新 `DashboardPage` 單元測試，驗證合併卡片包含兩個指標並移除舊區塊
- [x] 3.2 驗證 ready 與非 ready 狀態下，合併卡片都能顯示正確 fallback 與時間文案
- [x] 3.3 執行前端測試與 lint，確認版面調整未造成回歸
