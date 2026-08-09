## Why

目前儀表板個股區塊出現「簡單 K 線資料缺漏」，畫面雖載入股票代號與價格標題，但時間序列資料未完整呈現，與「應從資料庫回傳可用歷史資料」的預期不一致。需要補齊後端資料擷取、驗證與前端回退策略，避免使用者誤判為系統無資料。

## What Changes

- 修正儀表板股票時間序列 API 的資料來源優先序，明確以資料庫為主來源，僅在特定條件下才觸發外部回補流程。
- 增加資料可用性檢查與錯誤分類，區分「DB 無資料」、「查詢條件錯誤」、「同步未完成」三種情境。
- 調整前端圖表資料轉換與空資料顯示行為，避免因單一欄位缺值導致整段序列被丟棄。
- 補上 API 與服務層測試，覆蓋「DB 有資料應直接回傳」與「DB 缺漏時回補後再回傳」流程。

## Capabilities

### New Capabilities
- `dashboard-db-first-data-fallback`: 定義儀表板行情資料採 DB-first 與受控回補的行為規格

### Modified Capabilities
- `twse-open-data-sync`: 調整同步狀態與可查詢資料可用性之需求，確保前台查詢可判斷同步是否完成
- `stock-price-data-validation`: 補強價格時間序列完整性驗證需求，避免缺欄資料直接流入圖表層

## Impact

- 受影響程式碼：`backend/src/stock/*`、`backend/src/data-sync/*`、`frontend/src/pages/DashboardPage.vue`
- 受影響 API：股票行情/圖表資料查詢端點（讀取路徑與錯誤語意）
- 受影響系統：Prisma 資料讀取、資料同步排程、前端圖表資料映射
- 測試影響：需新增或調整 controller/service 單元測試與整合測試案例
