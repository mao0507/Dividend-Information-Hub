## ADDED Requirements

### Requirement: Seed 建立之 TWSE 上市標的與官方清單一致

在執行受版本控管之 Prisma seed 主流程後，系統 SHALL 使資料庫中 `Stock` 表內、`market` 為 `TWSE`（或設計書明定之同等篩選條件）之列，其**證券代號集合**與設計書選定之證交所公開上市證券清單**相同**，且**列數相等**於該清單之筆數。

「官方清單」SHALL 於 `backend/docs/TWSE_DATA_SOURCES.md`（或後續等同文件）載明資料來源 URL、抓取日期語意與節流策略。

#### Scenario: 成功匯入後筆數對齊

- **WHEN** 開發者於可連線 TWSE／公開資料之情境執行 `prisma db seed` 且清單抓取成功
- **THEN** 資料庫中符合約定篩選之 `Stock` 列數 SHALL 等於該次匯入所依據之官方清單筆數
- **AND** 該清單中每一證券代號 SHALL 於 `Stock.code` 存在對應一筆資料

### Requirement: 種子流程須文件化並可離線／快照驗證（其一）

系統 SHALL 提供至少一種下列可重現方式之一，並寫入 README 或 `TWSE_DATA_SOURCES.md`：

1. 透過環境變數指定本機快照檔路徑（例如事前下載之 CSV／JSON），於無對外網路時仍可完成相同範圍之 `Stock` 匯入；或  
2. 於 CI 使用固定版本之清單 fixture，使測試可驗證解析與 upsert 邏輯而不依賴即時 TWSE。

#### Scenario: 快照模式完成 upsert

- **WHEN** 環境已設定指向有效快照檔之路徑（實際變數名稱以實作為準）
- **THEN** `prisma db seed` SHALL 不依賴即時 HTTP 即可完成 `Stock` 之建立或更新
- **AND** 完成後 `Stock` 代號集合 SHALL 與該快照檔所代表之清單一致

### Requirement: 對外請求須節流並可記錄摘要

若 seed 執行時需向 TWSE 或資訊觀測站發起 HTTP 請求，實作 SHALL 限制並發與請求速率（例如單執行緒、請求間隔下限），並於記錄中輸出匯入筆數與來源摘要（不求完整 URL 含機密）。

#### Scenario: 記錄可稽核

- **WHEN** seed 於線上模式完成
- **THEN** 日誌或標準輸出 SHALL 包含成功寫入之 `Stock` 筆數（或與清單比對結果）
