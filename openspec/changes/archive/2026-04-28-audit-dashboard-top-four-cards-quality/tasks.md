## 1. 驗收規則落地

- [x] 1.1 檢查 `dashboardTopCards` 映射是否完整輸出 `title/displayValue/state/asOf`
- [x] 1.2 修正 `empty`、`stale`、`error` 三種狀態文案，確保可區分且不誤導
- [x] 1.3 修正四卡在非 ready 狀態一律顯示 `--`，禁止缺值顯示 `0`

## 2. 四卡與 Hero 一致性

- [x] 2.1 檢查四卡與 Hero 是否共用同一 `asOf/freshness` 判斷來源
- [x] 2.2 補上 Hero 降級時四卡同步降級的頁面邏輯或防呆
- [x] 2.3 檢查「下次入帳」日期輸出，禁止顯示原始 ISO timestamp

## 3. 驗證與完成度檢查

- [x] 3.1 補齊 utility 測試（ready/empty/stale/error 與缺欄位情境）
- [x] 3.2 補齊 Dashboard 頁面測試（Hero 無 asOf 時四卡中性降級）
- [ ] 3.3 進行手動檢查並記錄四卡在正常/缺值/過期的實際文案輸出
