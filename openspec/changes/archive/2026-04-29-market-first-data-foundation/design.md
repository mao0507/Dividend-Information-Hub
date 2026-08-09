## Context

目前系統採「DB-first」架構：`Stock` 資料表是手動 seed 的小清單，所有同步服務只處理 DB 中已存在的股票代號。配息資料為 `prisma/seed.ts` 以公式模擬產生的假資料（固定成長率），並非真實 TWSE 除息紀錄。系統完全不涵蓋上櫃（TPEx）市場。

探索階段驗證的關鍵 API 事實：
- `TWSE TWT49U?startDate=YYYYMMDD&endDate=YYYYMMDD`：可查詢指定期間全市場除息結果，資料最早至 2003 年（民國 92 年）
- `TWSE TWT49U?date=YYYYMMDD`：固定回傳當日資料，無法回溯
- `TPEx tpex_mainboard_daily_close_quotes`：提供全市場上櫃收盤行情（今日）
- `TPEx tpex_mainboard_peratio_analysis`：提供殖利率、每股股息（今日）
- TPEx 歷史除息批量 API：未找到對應端點，暫列 Open Questions

## Goals / Non-Goals

**Goals:**
- `Stock` 資料表反映 TWSE + TPEx 完整上市上櫃清單，每週自動更新
- TWSE 真實配息紀錄回填至 2003 年，取代假資料 seed
- 每日同步上櫃收盤行情
- `Dividend.filled` / `Dividend.fillDays` 由服務計算並持續維護
- 架構翻轉後所有 sync 服務以 `Stock` 全量（含 TWSE + TPEX）為工作範圍

**Non-Goals:**
- 盤中即時報價（接受盤後資料）
- TPEx 歷史除息資料回填（API 未確認，延後）
- PE ratio / 市值自動更新（非本次範圍）
- FinMind 整合（保留介面，本次不啟用）

## Decisions

### Decision 1：Schema 增量擴充，不破壞現有關聯

`Stock` 新增兩個欄位：
```
market   String  @default("TWSE")   // "TWSE" | "TPEX"
isActive Boolean @default(true)     // false = 已下市，保留歷史紀錄
```

**理由**：下市股票不刪除，避免破壞 `Dividend`、`StockPrice`、`WatchlistItem` 的外鍵關聯與歷史查詢。`isActive=false` 讓前端可過濾，同時保留資料完整性。

替代方案考慮：新增獨立 `MarketUniverse` 資料表 → 拒絕，引入不必要的 join，`Stock` 本身就是宇宙。

---

### Decision 2：配息歷史回填逐年批次，每年一次 API 請求

以年為單位呼叫 TWT49U `startDate=YYYY0101&endDate=YYYY1231`，2003→目前年份，共約 22 次請求，每次 350ms 節流，總耗時約 8 秒。寫入以 `(stockCode, exDate ±3 天)` 為 key upsert，避免重複。

**理由**：單次全量 `2003-01-01 ~ 今日` 回傳資料量未知且 API 可能限制；逐年可中斷、可重試、可重跑單年。

進度維護：使用現有 `MarketSyncState` 資料表，key = `twse_dividend_history_backfill`，`lastOkDate` 存最後成功回填的年份（以 `YYYY-01-01` 表示）。

---

### Decision 3：TPEx 股價同步獨立 Service，共用 StockPrice 資料表

新建 `TpexPriceSyncService`，透過 `tpex_mainboard_daily_close_quotes` 取得全市場上櫃收盤，過濾 `Stock.market='TPEX'` 的代號後 upsert 至 `StockPrice`。不新增資料表，`StockPrice` 以 `(stockCode, date)` unique 約束確保唯一。

**理由**：資料結構完全一致（OHLCV），共用資料表降低前端查詢複雜度。

---

### Decision 4：填息追蹤每日盤後掃描，非即時計算

`DividendFillTrackerService` 在每日股價同步完成後觸發，掃描所有 `filled=false` 且 `exDate <= 今日` 的配息紀錄，查詢 exDate 後的每日收盤價，判斷是否已回到除息前收盤價（`exPrice`，來自 TWT49U `除權息前收盤價` 欄位）。

填息判斷：當日收盤 >= `exPrice`（除息前收盤）→ `filled=true`，`fillDays` = exDate 至填息日的交易日數。

**理由**：填息是滯後指標，盤後批次計算足夠；即時計算需要盤中報價，超出 Non-Goals。

需在 `Dividend` 新增欄位：`preExClose Float?`（除息前收盤，存入後供 FillTracker 使用）。

---

### Decision 5：股票宇宙刷新以 STOCK_DAY_ALL + TPEx API 為來源，每週日執行

- TWSE：`STOCK_DAY_ALL` 提供代號 + 簡稱，`t187ap05_L` 提供產業別（已有實作於 `twse-seed-universe.ts`，直接複用）
- TPEx：`tpex_mainboard_daily_close_quotes` 欄位含代號 (`SecuritiesCompanyCode`) + 名稱 (`CompanyName`)；產業別另從 TPEx OpenAPI 查詢
- 比對策略：新代號 → INSERT；已存在 → UPDATE name（若有變）；不在最新清單中 → `isActive=false`

## Risks / Trade-offs

- **TWSE TWT49U 存取頻率限制**：連續 22 次請求可能觸發封鎖。→ 節流 500ms（較現有 350ms 保守），回填失敗時可從 `lastOkDate` 續跑
- **TPEx 配息歷史缺口**：目前無歷史除息批量 API，TPEx 股票的 `fillDays` 計算缺少歷史基準。→ 接受此缺口，TPEx 配息資料從開始同步後逐漸累積
- **`preExClose` 欄位依賴 TWT49U 資料品質**：TWT49U 的「除權息前收盤價」是填息計算基準，若資料有誤則 `fillDays` 不準。→ 現階段信任來源，未來可加驗證端點
- **上市上櫃合計 ~1800 支股票**：股票宇宙刷新與配息回填的資料量大幅增加，需確認 DB 索引效率（`StockPrice` 已有 `(stockCode, date)` 複合索引）

## Migration Plan

1. 執行 Prisma migration：`Stock` 新增 `isActive`、`Dividend` 新增 `preExClose`
2. 執行股票宇宙全量刷新（手動觸發一次）：寫入 TWSE + TPEx 全市場 ~1800 筆
3. 執行配息歷史回填（手動觸發一次）：從 2003 年逐年寫入，預計數分鐘
4. 執行 `DividendFillTrackerService` 初始計算（手動觸發一次）
5. 移除 `prisma/seed.ts` 中的假配息 template 區塊
6. 啟用新 Cron 排程（宇宙刷新、填息追蹤）

**Rollback**：migration 可逆（`isActive` / `preExClose` 欄位刪除不影響現有邏輯）；假資料移除不可逆，需確認回填完成後再執行步驟 5。

## Open Questions

1. **TPEx 歷史除息 API**：是否有對應 TWT49U 的歷史批量查詢端點？需要繼續調查。找到後可補充 `dividend-history-backfill` 以涵蓋 TPEx。
2. **TPEx 產業別來源**：`tpex_mainboard_daily_close_quotes` 無產業欄位，需確認正確的 TPEx OpenAPI 產業對照端點。
3. **填息判斷閾值**：使用「收盤價 >= 除息前收盤」是嚴格標準，部分股票可能因為大盤波動無法精確填息。是否允許 ±1% 容差？
