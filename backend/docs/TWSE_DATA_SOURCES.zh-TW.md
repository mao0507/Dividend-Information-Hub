# TWSE 公開資料來源（本專案使用）

本文件對應 `data-sync` 模組之股價同步實作，供維運與擴充參考。

## 每日收盤後 - 全日行情（上市）

| 項目 | 說明 |
|------|------|
| **用途** | 取得單一交易日全部上市標的 OHLCV，寫入 `StockPrice` |
| **端點** | `GET https://www.twse.com.tw/rwd/zh/afterTrading/STOCK_DAY_ALL` |
| **參數** | `date=YYYYMMDD`（西元日期）、`response=json` |
| **欄位映射** | 見 `StockPriceSyncService`（代號、成交量、開高低收） |
| **節流建議** | 程式內已對單日請求做重試退避；回填時建議逐日呼叫，日與日間隔 >=300ms（見 `TwseDailyBackfillService`） |
| **失敗行為** | HTTP 錯誤時指數退避最多重試 3 次；仍失敗則該日拋錯（可由 checkpoint 續跑） |

## Prisma Seed - 上市證券代號（`Stock` 全表 upsert）

| 項目 | 說明 |
|------|------|
| **用途** | `npm run db:seed` 時，將 `Stock` 與 TWSE 全日行情涵蓋標的對齊 |
| **資料合成** | 1) `STOCK_DAY_ALL`：取最近有成交資料的台北日曆日之全體證券代號。2) `t187ap03_L`：上市公司證券代號對應公司簡稱。3) `t187ap05_L`：上市公司證券代號對應產業別。4) 不在上市公司清單中的代號（常見 ETF 或商品）依規則分類。 |
| **離線快照** | 設定 `SEED_TWSE_LIST_PATH` 指向本機 JSON（格式見 `resolveTwseSeedStocks` 與 `sample-universe.json`）可略過 HTTP |
| **下市/舊代號** | Seed 採 upsert，不刪除 DB 內舊代號，避免破壞 `StockPrice` 外鍵 |
| **筆數驗證** | 線上模式成功後，`Stock` 筆數應與本次 `STOCK_DAY_ALL` 的 `data` 列數一致 |

```sql
SELECT COUNT(*) AS n
FROM "Stock"
WHERE "market" = 'TWSE';
```

## 合規與請求禮儀

- 避免高併發壓測官方端點。
- 生產環境請以 `DATA_SYNC_SECRET` 保護回填端點。
- 請求已帶瀏覽器樣式 User-Agent；若官方政策變更需同步調整。

## 環境變數

| 變數 | 用途 |
|------|------|
| `SYNC_ENABLED` | 設為 `true` 時啟用排程 |
| `DATA_SYNC_SECRET` | 對應標頭 `x-data-sync-secret`，供 `POST /api/data-sync/backfill/prices` 驗證 |
| `SEED_TWSE_LIST_PATH` | 可選，本機 JSON 快照來源；seed 時可不連 TWSE/OpenAPI |

## 運維備忘（回填與排程）

- 暫停自動同步：`SYNC_ENABLED` 設為非 `true`。
- 長區間回填：請分小日期區間執行。
- 失敗日期會落在 `failedDates`。
- checkpoint 僅在成功日更新。
- 可用 `resume: true` 從上次成功日後一天續跑。

手動回填範例：

```bash
curl -sS -X POST "http://localhost:3000/data-sync/backfill/prices" \
  -H "Content-Type: application/json" \
  -H "x-data-sync-secret: YOUR_SECRET" \
  -d '{"fromDate":"2024-01-02","toDate":"2024-01-10","resume":false}'
```

若經 Vite 代理，URL 可改為：

`http://localhost:5173/api/data-sync/backfill/prices`

快速驗收建議：

- 選 5 個連續交易日。
- 比對 `StockPrice` 筆數與抽樣數值是否與 TWSE 來源一致。

## 價格驗證流程（單股、單日）

當某檔股票某日價格看起來異常，可先呼叫驗證端點：

```bash
curl -sS -X POST "http://localhost:3000/data-sync/validate/price" \
  -H "Content-Type: application/json" \
  -H "x-data-sync-secret: YOUR_SECRET" \
  -d '{"stockCode":"2330","date":"2026-04-26"}'
```

### 回應欄位

- `normalizedDate`：以 `Asia/Taipei` 正規化後日期
- `isTradingDay`：該日是否為 TWSE 交易日
- `status`：
  - `MATCH`
  - `NOT_TRADING_DAY`
  - `MISSING_IN_DB`
  - `MISSING_IN_SOURCE`
  - `VALUE_MISMATCH`
  - `PARSE_ERROR`

### 範例輸出（`2330` 於 `2026-04-26`）

```json
{
  "stockCode": "2330",
  "normalizedDate": "2026-04-26",
  "isTradingDay": false,
  "status": "NOT_TRADING_DAY",
  "reason": "查詢日期不是 TWSE 交易日（可能為休市日）",
  "dbClose": null,
  "sourceClose": null,
  "sourceFetchAt": "2026-04-27T06:30:00.000Z"
}
```

若狀態為 `NOT_TRADING_DAY`，通常不屬於資料異常。
