## 1. 調查與對齊

- [x] 1.1 比對 `calendar` 模組（或即將除息 API）與 `DashboardService` 對 `exDate` 的篩選條件，記錄差異於 PR／commit 說明
- [x] 1.2 確認 `Dividend.exDate` 寫入時區／儲存格式（Prisma/DB），避免測試與執行環境假設不一致

## 2. 核心實作

- [x] 2.1 實作（或重用）`Asia/Taipei` 之「本週週一 00:00～週日 23:59:59.999」區間計算，並用於 `weekExDiv` 查詢
- [x] 2.2 將 `todayExDiv` 改為同一台北日界線之當日起訖
- [x] 2.3 `weekExDiv.count` 改為區間內**相異 `stockCode`** 數；`watchlistCount` 以相同集合與自選股交集計算

## 3. 測試與驗收

- [x] 3.1 新增或擴充 `dashboard.service` 單元測試：固定參考日、種子股息，覆蓋週界、上週日、本週日、多筆同股
- [x] 3.2 手動：本機有 本週 `exDate` 種子時，Dashboard「本週除息」小卡檔數與 DB 預期一致；無種子時確認為資料空而非計算錯誤
