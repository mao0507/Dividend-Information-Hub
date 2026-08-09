## Why

目前系統缺少可持久化的買入明細與投資金額結構，使用者無法追蹤自己的真實持倉成本與持有比重，也難以解釋「已獲得除息收入」的計算來源。需要新增一個完整持股管理能力，讓投資資料從輸入到視覺化都有一致資料契約。

## What Changes

- 新增使用者持股買入明細管理能力，支援記錄股票代碼、買入時間、買入價格、買入數量。
- 新增持股彙總與展開明細顯示能力：同檔股票以彙總顯示，並可展開查看每筆買入紀錄。
- 新增投資比重資料輸出與前端圓餅圖顯示，以「總投資金額（買入價格 × 買入數量）」呈現持有占比。
- 新增「已獲得除息收入」計算規則：以買入時間為起點，累計符合條件的已入帳股息金額。
- 調整既有視覺化持股來源規則，從「僅 Holding 或 watchlist fallback」擴充為可讀取持股 lot 明細並保持一致口徑。

## Capabilities

### New Capabilities
- `holding-management`: 定義持股買入明細建立、持股彙總輸出、lot 明細展開與資料驗證規則
- `holding-allocation-pie`: 定義總投資金額占比資料契約與圓餅圖呈現需求
- `holding-dividend-income-from-buy-date`: 定義從買入時間起算的已獲得除息收入計算規則

### Modified Capabilities
- `dashboard-top-summary-cards`: 累積股息收入來源口徑需能與持股明細資料一致，避免與新持股管理能力產生定義衝突

## Impact

- 後端：Prisma schema/migration、新增 holdings module（controller/service/dto）、調整 dashboard/viz 相關資料來源邏輯
- 前端：新增 holdings API、路由與持股管理頁面、圓餅圖與表單互動、型別與單元測試
- 測試：新增後端服務與控制器測試、前端頁面與資料轉換測試
