## Why

目前 `prisma/seed.ts` 以硬編碼約 50 檔示範股建立 `Stock`，與證交所**當期上市標的數量**差距極大，導致全市場股價同步／回填只能涵蓋既有列，無法用 seed 還原「與台股上市檔數一致」的開發／測試環境。需要將 seed（或 seed 前置步驟）對齊官方公開之上市證券清單，使 `Stock` 筆數與選定之台股範圍一致。

## What Changes

- 定義「台股上市標的」之**正式範圍**（與證交所公開清單對齊；例如是否含 ETF、存託憑證、特別股等，需可說明且可驗證）。
- 實作自 **TWSE／公開資料端點**取得證券代碼與基本欄位（名稱、產業／市場別等），並 **upsert 至 `Stock`**，取代或補齊既有硬編碼清單。
- 更新 **`prisma db seed`** 流程：於種子時（或文件化之子指令）執行上述匯入，並可選支援**離線快照**（無網路 CI／Deterministic 測試）。
- 補充 **`backend/docs/TWSE_DATA_SOURCES.md`**（或等效文件）：清單來源 URL、節流、與官方筆數對照之驗收方式。

## Capabilities

### New Capabilities

- `twse-seed-stock-universe`: Prisma seed 或等效初始化流程須能將 `Stock` 表建立為與選定之 TWSE 上市證券清單**筆數與代號集合一致**（依設計書界定之範圍），並支援可重現與運維驗證。

### Modified Capabilities

- （無）— 現有 `openspec/specs/` 下無對應 prisma seed 之規格；本 change 以新增 capability 為主。

## Impact

- **後端**：`backend/prisma/seed.ts`、可能新增 `backend/src/**` 之 TWSE 清單抓取／解析模組（或獨立 `scripts/`）。
- **資料庫**：`Stock` 列數大量增加；seed 時間與對外請求頻率需節流。
- **開發體驗**：首次 seed 依網路與 TWSE 可用性；需提供離線／快照選項以降低不確定性。
- **相依**：與既有 `twse-full-market-sync`（股價寫入僅限 `Stock` 已存在代號）互補—完成本 change 後，同一套股價同步方能涵蓋「全市場」代號。
