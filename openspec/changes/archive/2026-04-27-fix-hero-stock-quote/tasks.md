## 1. 後端計算與測試

- [x] 1.1 調整 `StockService.getDetail`（或共用函式）之昨收查詢與 `change`／`changePct` 計算，符合 design 之基準價定義
- [x] 1.2 新增或更新單元測試：僅一筆價格、兩筆以上價格、異常門檻（若有）
- [x] 1.3 檢視種子資料是否造成 featured 檔報價突兀，必要時微調 seed 價格序列（種子為連續日平滑生成；異常已由後端比值門檻抑制）

## 2. 前端與驗證

- [x] 2.1 確認 `DashboardPage` Hero 區直接使用 API 回傳之 `change`／`changePct`，無需重算；若有防呆顯示則與後端約定一致（已直接使用 `heroStock`，無重算）
- [x] 2.2 手動驗證：儀表板 Hero 與個股詳情對同一檔股票之漲跌幅一致且在合理範圍（API 同源 `getDetail`；請本地開頁面對照確認）
