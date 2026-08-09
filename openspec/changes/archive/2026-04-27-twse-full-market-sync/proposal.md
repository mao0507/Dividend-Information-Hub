## Why

專案目前僅透過既有同步服務零星抓取股價與配息，尚未系統化涵蓋「證交所公開可得之標的範圍」與「完整歷史時間軸」。為支援回測、儀表板與稽核，需要以台股官方／公開資料來源為準，建立可重現的歷史回填與增量更新流程，並由排程定期執行，降低人工匯入與資料缺口。

## What Changes

- 定義「台股公開資料」之**納入範圍**（至少：上市普通股日線 OHLCV、證交所可取得之每日收盤行情；延伸可排入除權除息、基本市況等，依 API 可行性分階段）。
- 實作或擴充**歷史回填**管線（依交易日逐日或分批向 TWSE／MIS 等公開端點請求，寫入既有 `StockPrice` 等 schema 或約定之表）。
- 擴充**增量同步**（已有之每日收盤後同步邏輯對齊新範圍與錯誤重試策略）。
- 新增或整併 **Nest `@nestjs/schedule`／外層 Cron** 之排程設定：回填與日常更新分頻率、時區 `Asia/Taipei`、環境開關（沿用 `SYNC_ENABLED` 或新增標誌）。
- 提供**手動触发**介面（既有或新增 `data-sync` controller／CLI）供一次性全量／指定期間回填。
- 補強**記錄與可觀測性**（每執行同步筆數、失敗日期、耗時）。

## Capabilities

### New Capabilities

- `twse-open-data-sync`: 從台灣證交所及相關公開資料介面（如 OpenAPI、CSV 每日行情）取得上市標的之日線與最新可取得之行情資料，支援歷史區間回填與交易日增量更新，並與現有資料庫模型對應。

### Modified Capabilities

- 無（現有 `openspec/specs` 無對應市場資料管線規格）

## Impact

- 後端：`backend/src/data-sync/*`、`SyncSchedulerService`、可能新增服務模組與設定（`ConfigService`、環境變數）。
- 資料庫：可能新增 migration（若需存同步游標／工作佇列）；既有 `Stock`／`StockPrice` 寫入量大幅增加。
- 運維：長時間回填之 CPU／網路／DB 負載；需設定節流與重試，避免對公開站點造成不當壓力（**遵守證交所使用條款與 robots／流量禮儀**）。
