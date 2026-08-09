## 1. Database and Data Model

- [x] 1.1 新增使用者持股買入紀錄資料表（userId、stockCode、buyTimestamp、buyPrice、buyQuantity）與必要索引
- [x] 1.2 更新 Prisma schema、migration 與 seed/fixture，確保本地與測試環境可建立資料
- [x] 1.3 補上資料驗證規則（買入價格與買入數量必須大於 0、買入時間必填）

## 2. Backend API and Domain Logic

- [x] 2.1 實作持股買入紀錄建立 API（create holding lot）與輸入 DTO 驗證
- [x] 2.2 實作持股買入紀錄查詢 API（list holding lots）並限制僅可讀取本人資料
- [x] 2.3 實作總投資金額與股票持有比重聚合服務，輸出儀表板圓餅圖資料格式
- [x] 2.4 實作自買入日起累積除息收入計算服務，依除息事件與買入批次加總
- [x] 2.5 整合儀表板 API 回傳總投資、圓餅圖切片與累積除息收入欄位

## 3. Frontend Dashboard Integration

- [x] 3.1 新增持股買入紀錄輸入介面（股票、買入時間、買入價格、買入數量）與表單驗證
- [x] 3.2 串接持股建立/查詢 API，顯示使用者持股紀錄列表
- [x] 3.3 在 Dashboard 新增總投資金額與股票持有比重圓餅圖視覺區塊
- [x] 3.4 在 Dashboard 新增「自買入日起累積除息收入」指標顯示與格式化

## 4. Tests and Verification

- [x] 4.1 新增後端單元測試：持股建立驗證、持股查詢隔離、圓餅圖聚合計算
- [x] 4.2 新增後端單元測試：自買入日起累積除息收入計算（含買入日前後邊界案例）
- [x] 4.3 新增前端元件/頁面測試：表單驗證、圓餅圖資料渲染、累積除息收入顯示
- [x] 4.4 執行整體測試與 lint，確認新功能在既有 dashboard 與資料同步流程不回歸
