## Why

目前圖表會顯示沒有資料的日期，造成折線中斷、空白點或誤解為資料異常。這會直接影響使用者判讀走勢，因此需要把時間軸收斂到「實際有資料的交易日」。

## What Changes

- 前端圖表資料轉換流程改為僅輸出有有效價格資料的日期點。
- 圖表時間軸與資料點數量必須一致，不可插入無資料日期佔位。
- 明確定義「有效資料」判斷規則（日期存在且收盤價可解析）。
- 新增對應測試，覆蓋連續交易日、缺資料日、混合資料等情境。

## Capabilities

### New Capabilities
- `chart-dates-with-data-only`: 規範圖表只顯示有資料的日期，並定義資料篩選與時間軸對齊行為。

### Modified Capabilities
- 無

## Impact

- `frontend/src/utils/chartData.ts`（或同等資料轉換層）
- `frontend/src/components/chart/TvChart.vue`（圖表 x 軸資料來源與繪製輸入）
- `frontend/src/pages/DashboardPage.vue`、`frontend/src/pages/StockDetailPage.vue`（使用圖表資料的頁面）
- 圖表相關單元測試（`chartData.spec.ts`、`TvChart.spec.ts`）
