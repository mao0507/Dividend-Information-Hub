## Context

系統目前以 `prisma/seed.ts` 產生的靜態假資料驅動所有功能（股價、配息）。後端 NestJS 已有完整的 Prisma 資料存取層，但缺乏從外部取得真實資料的機制。

外部資料來源選項：
- **TWSE**（台灣證券交易所）：提供免費、無需 API Key 的 REST JSON 端點，涵蓋上市股票每日收盤資料
- **FinMind**：台灣金融資料平台，提供更結構化的配息資料，免費方案每日 100 次請求
- **Yahoo Finance**：非官方 API，不穩定，不建議依賴

系統需要的資料類型：
1. **每日股價**（StockPrice）：OHLCV、成交量 — 每個交易日盤後更新
2. **配息記錄**（Dividend）：除息日、股利金額、填息狀態 — 每季 / 年度更新

## Goals / Non-Goals

**Goals:**
- 每日盤後（15:00 台灣時間）自動從 TWSE 抓取最新收盤股價，upsert 至 `StockPrice`
- 每週從 FinMind 抓取配息公告，upsert 至 `Dividend`（含 exDate、payDate、cash）
- 提供 `POST /data-sync/trigger` 手動觸發端點供開發測試
- 同步失敗時記錄詳細 log，不影響既有 API 回應

**Non-Goals:**
- 即時（秒級）行情更新
- OTC（上櫃）股票（初版僅支援 TWSE 上市股）
- 自動新增 seed 未收錄的股票（不自動擴充 Stock 清單）
- 前端 UI 顯示「最後同步時間」（日後可加）

## Decisions

### 決策 1：使用 @nestjs/schedule 內建 Cron

**選項：**
- A) `@nestjs/schedule` + `node-cron`（採用）
- B) 外部 cron job（OS cron / k8s CronJob）
- C) Bull Queue + Redis

**理由：**  
專案已是 NestJS，`@nestjs/schedule` 零額外基礎設施需求，DI 整合最佳。外部 cron 需要額外部署設定；Bull Queue 過重。

---

### 決策 2：股價資料來源選 TWSE STOCK_DAY_ALL（批量端點）

**選項：**
- A) `GET https://www.twse.com.tw/rwd/zh/afterTrading/STOCK_DAY_ALL?date={YYYYMMDD}&response=json`（採用）
- B) 逐股查詢 `STOCK_DAY?stockNo={code}`

**理由：**  
`STOCK_DAY_ALL` 一次回傳當日所有上市股票，減少 HTTP 請求次數（約 1000+ 筆 vs 逐股 1000+ 次請求）。TWSE rate limit 風險大幅降低。

---

### 決策 3：配息資料來源選 FinMind TaiwanStockDividend

**選項：**
- A) FinMind `TaiwanStockDividend` dataset（採用）
- B) TWSE MOPS 個股查詢（HTML scraping，不穩定）

**理由：**  
FinMind 提供結構化 JSON，欄位與 Prisma `Dividend` model 高度對應。免費方案每日 100 次，足夠週批次更新（約 50–60 支股票）。

---

### 決策 4：upsert 策略（不覆蓋手動修正）

資料寫入使用 Prisma `upsert`，以 `(stockCode, date)` 為 unique key。
- 若已存在：只更新 TWSE 提供的欄位（close、volume 等）
- `filled`、`fillDays` 欄位由系統計算邏輯更新，不被外部資料覆蓋

---

### 決策 5：環境變數控制 Cron 啟動

`SYNC_ENABLED=true` 才啟動排程，開發環境預設 `false`，避免測試時意外觸發外部請求。

## Risks / Trade-offs

| 風險 | 緩解措施 |
|------|---------|
| TWSE API 回傳格式改版 | 在 adapter 層加型別驗證（Zod）；失敗時 log 並跳過，不中斷服務 |
| FinMind 免費方案限速（100 req/day） | 批次股票分天更新；非關鍵資料可延遲同步 |
| 盤後 API 回傳前觸發（如 14:58）| Cron 設為 15:30 台灣時間，預留緩衝 |
| DB upsert 量大導致連線壓力 | 使用 `Promise.allSettled` 並行但限制 concurrency（max 10） |
| 非交易日觸發（假日、例假）| TWSE API 非交易日回傳空陣列，可安全跳過 |

## Migration Plan

1. 安裝 `@nestjs/schedule` 套件
2. 建立 `DataSyncModule`，不影響現有模組
3. 在 `AppModule` imports 中加入 `DataSyncModule` 與 `ScheduleModule.forRoot()`
4. 設定 `SYNC_ENABLED=false`（dev）、`SYNC_ENABLED=true`（prod）
5. 第一次啟動後可手動呼叫 `POST /data-sync/trigger` 補跑歷史資料

**回滾策略：** 在 `AppModule` 移除 `DataSyncModule` 匯入即可停用，DB 資料不受影響。
