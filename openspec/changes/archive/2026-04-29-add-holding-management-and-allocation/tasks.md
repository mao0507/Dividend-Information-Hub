## 1. 資料模型與後端基礎

- [x] 1.1 新增 `HoldingLot` Prisma schema 與 migration（含索引與外鍵）；同步在 `Holding` 新增 `earnedDividend Float @default(0)` 欄位
- [x] 1.2 建立 holdings module 與基本 controller/service 架構並註冊到 app module
- [x] 1.3 新增 lot 建立 DTO 與驗證規則（stockCode、buyDate、buyPrice、shares）
- [x] 1.4 新增 lot 刪除 DTO／參數驗證（lotId 格式）

## 2. 持股 lot 與彙總邏輯

- [x] 2.1 實作 `POST /holdings/lots`：建立 lot 並同步重算對應 `Holding` 彙總（shares、avgCost 加權均價、boughtAt 最早日、earnedDividend）
- [x] 2.2 實作 `DELETE /holdings/lots/:id`：刪除 lot 後重算 Holding 彙總；若為最後一筆 lot 則連帶刪除 Holding
- [x] 2.3 實作 `GET /holdings`：回傳每檔彙總資料（含快取的 earnedDividend）與 lot 明細清單
- [x] 2.4 實作 `GET /holdings/allocation`：回傳成本基礎投資金額資料 `{ stockCode, name, totalCost }[]`（不含 percentage，由前端計算）
- [x] 2.5 在 `DividendFillTrackerService.track()` 末尾新增 batch 重算步驟：以單一 JOIN SQL 更新所有 `Holding.earnedDividend`

## 3. 前端頁面與互動

- [x] 3.1 新增 `holdings` API client、型別與 `/holdings` 路由
- [x] 3.2 建立 `HoldingsPage`：買入 lot 表單 + 持股彙總列表 + lot 展開明細 + 刪除 lot 操作
- [x] 3.3 實作總投資金額圓餅圖與總計摘要（totalCost 由前端加總計算 percentage；單檔時不顯示圓餅圖，改顯示純數字）

## 4. 測試與驗證

- [x] 4.1 新增後端測試：lot 建立、lot 刪除（含最後一筆刪 Holding）、holding 彙總重算（avgCost 加權）、earnedDividend 快取計算、allocation 輸出格式
- [x] 4.2 新增前端測試：表單送出、lot 刪除確認、明細展開、圓餅圖資料顯示、單檔邊界顯示
- [x] 4.3 執行目標測試與 lint，確認不回歸既有 dashboard/viz 行為
