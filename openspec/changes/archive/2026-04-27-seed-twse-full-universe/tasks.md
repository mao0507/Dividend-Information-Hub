## 1. 調研與文件

- [x] 1.1 選定 TWSE 上市證券「一覽式」公開來源（URL、格式、更新頻率），並寫入 `backend/docs/TWSE_DATA_SOURCES.md`
- [x] 1.2 在設計書或文件釐清範圍：是否含 ETF／存託憑證／特別股，以及如何與官方統計「家數」對照

## 2. 匯入邏輯與測試

- [x] 2.1 實作下載／解析／映射至 `Stock` 模型之純函式（或獨立模組），含錯誤類型與節流
- [x] 2.2 新增單元測試：固定 HTML／CSV fixture 解析、`code`／`name`／`isEtf` 等欄位映射
- [x] 2.3 實作快照檔模式（環境變數路徑）使 CI 可不連外網重播匯入

## 3. Prisma Seed 整合

- [x] 3.1 調整 `prisma/seed.ts`：於建立 User／Dividend 等資料前完成 TWSE `Stock` 全量 upsert；處理舊 50 檔硬編碼之汰除或改為輔助示範子集
- [x] 3.2 確認 FK 順序：`WatchlistItem`／`StockPrice` 等依賴 `Stock` 之種子仍合法
- [x] 3.3 決策並實作：已下市／自官方清單消失之代號是否保留於 DB（預設建議保留與文件化）

## 4. 驗收與運維

- [x] 4.1 提供驗證步驟：`COUNT(*)` 與官方頁面／清單列數比對程序（可為手動 checklist）
- [x] 4.2 更新根目錄或 `backend` README 之 seed 說明（必要環境變數、首次執行時間預期）
