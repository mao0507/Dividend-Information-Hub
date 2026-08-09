## Why

儀表板 Hero 區塊顯示的自選「首檔」個股價格與漲跌幅，曾出現與常識嚴重不符的數值（例如漲跌幅達數百～千趴），破壞使用者對報價資訊的信任，也與個股詳情頁或 K 線走勢給人的感受不一致。需在資料來源與計算規則上收斂，確保 Hero 區報價可解讀且可驗證。

## What Changes

- 統一 Hero 個股「最新價、漲跌額、漲跌幅」的計算依據（前一交易日收盤價／可比對之基準價），避免種子資料或查詢順序造成的異常比值。
- 後端 `GET /stocks/:code`（或等效 detail）在無法取得合理昨收時，應回傳明確語意（例如漲跌幅為 0 或標示不可用），禁止回傳誤導性極端百分比。
- 前端 Hero 區僅展示後端已校正的數值；可選加上合理範圍檢核（例如絕對值超過門檻時改顯示「—」或警示樣式）。
- 補齊或調整後端／整合測試，覆蓋「僅一筆價格」「昨收缺失」「連續兩日價格」等情境。

## Capabilities

### New Capabilities

- `dashboard-hero-quote-accuracy`: 儀表板 Hero 個股報價（價格、漲跌額、漲跌幅）須基於一致且可查證的基準價計算，並避免對使用者展示明顯不合理的漲跌幅。

### Modified Capabilities

- 無（現有 `openspec/specs` 無對應股票報價規格）

## Impact

- 後端：`backend/src/stock/stock.service.ts`（`getDetail` 價差計算）、可能含 Prisma 查詢／種子資料一致性。
- 前端：`frontend/src/pages/DashboardPage.vue` Hero 區顯示邏輯（若需防呆）。
- API 回傳型別維持 `StockDetail`，欄位語意更嚴謹（非 **BREAKING** 若僅修正數值合理性）。
