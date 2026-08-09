## Why

儀表板目前將「累積股息收入」與「總投資金額」拆成兩個區塊，視覺焦點分散且資訊關聯性不夠直接。需要把這兩個高度相關的財務指標整合成單一卡片，提升掃讀效率與一致性。

## What Changes

- 將儀表板中的「累積股息收入」與「總投資金額」合併為同一卡片呈現。
- 單一卡片需同時顯示：累積股息收入、總投資金額、以及資料時間/狀態訊息。
- 移除舊有雙區塊並以新卡片取代，避免重複資訊與版面斷裂。
- 更新前端測試，確保合併後卡片在有資料、無資料、錯誤狀態下都能穩定顯示。

## Capabilities

### New Capabilities
- `dashboard-combined-income-investment-card`: 儀表板以單一卡片整合顯示累積股息收入與總投資金額。

### Modified Capabilities
- （無）

## Impact

- Frontend：`DashboardPage` 的區塊結構、樣式與文案會調整。
- Frontend tests：需更新頁面測試以反映新卡片結構。
- Backend API：沿用既有摘要欄位，不新增 API。
