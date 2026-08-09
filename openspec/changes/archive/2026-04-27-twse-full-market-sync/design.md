## Context

後端已有 `StockPriceSyncService`（TWSE 每日行情）、`DividendSyncService`、`SyncSchedulerService`（收盤後／週配息）。尚未涵蓋「全上市標的 × 完整歷史日線」之系統化回填，且「證交所全部資料」在實務上包含財報、公告、基本市況等多類別，需分階段與授權邊界內實作。本設計以**公開、可自動化取得之證交所／資訊觀測站介面**為主資料來源。

## Goals / Non-Goals

**Goals:**

- 明確列出第一階段納入之資料集（建議優先：上市股票日線 OHLCV、上市證券代碼／名稱對照之更新）。
- 歷史回填採**可重啟**之批次策略（依交易日迭代、checkpoint、失敗重試與節流）。
- 增量同步與既有排程整合（同一時區、環境開關、結構化 log）。
- 對外公開 API 請求遵守**節流、User-Agent、錯誤重試與非尖峰時段批次**。

**Non-Goals:**

- 一次實作證交所**全部**次系統（承銷、公告全文檢索、XBRL 等）—需另開需求與法遵檢視。
- 即時盤中 Tick／Order book（非本階段 TWSE 公開免費範圍之預設目標）。
- 櫃買中心 OTＣ 可列為第二階段，本文預設以 **TWSE 上市**為主範圍。

## Decisions

1. **資料來源優先序**  
   - **首選**：證交所／資訊觀測站**官方開放介面與文件化之 CSV／OpenAPI**（與現有 `StockPriceSyncService` 技術路線一致）。  
   - **備援**：FinMind、TEJ 等第三方—僅在官方不可用且授權允許時啟用（需設定與金鑰）。  
   - *理由*：合規與長期可維護性。

2. **回填策略**  
   - 以**交易日清單**驅動（由日曆或證交所休市資訊推算），對每一日呼叫既有或抽取之「全日行情」API／檔案，批次 upsert。  
   - 維護 **`SyncCursor` 或環境變數 checkpoint**（例如最後成功日期），支援中斷續跑。  
   - *替代方案*：依股票代號外層迴圈—請求次數過多，不採。

3. **排程**  
   - **每日**：延續既有 `15:30 Asia/Taipei` 收盤後增量（已存在則擴充為全標的）。  
   - **每週／離峰**：可選低優先度之「上市證券基本資料」同步。  
   - **回填**：不以 Cron 預設全量跑滿；改由 **一次性 CLI／Admin API** 觸發，避免誤觸長時任務。

4. **儲存模型**  
   - 優先複用 `StockPrice`（`stockCode`, `date`, OHLCV）；若需記錄同步進度，新增 `MarketSyncState`（`key`, `lastOkDate`, `updatedAt`）輕量表。

## Risks / Trade-offs

- [對公開站點請求過於頻繁被封鎖] → 固定延遲、失敗指數退避、單機 concurrency 上限。  
- [回填耗時數天至數週] → checkpoint、可暫停、進度 log。  
- [「全部資料」期望與實作落差] → proposal／README 列第一階段範圍與 roadmap。

## Migration Plan

- 新增 migration（若有 `MarketSyncState`）。  
- 部署後先於 staging 跑小區間回填驗證，再上 production。  
- Rollback：停用 `SYNC_*` 旗標並還原 migration（若無新表則僅程式 rollback）。

## Open Questions

- 是否納入 **TPEx 櫃買**與 **ETF／特別股**於同一管線（代號規則與 schema）。  
- 是否需 **法人／外资**籌資訊—通常另源，待產品確認。
