# TWSE Data Sources Used By This Project

This document maps to the `data-sync` module implementation for stock price sync.

## Daily After Close - Full Day Market Data (TWSE)

| Item | Description |
|------|-------------|
| Purpose | Fetch OHLCV for all TWSE symbols in one trading day and write into `StockPrice` |
| Endpoint | `GET https://www.twse.com.tw/rwd/zh/afterTrading/STOCK_DAY_ALL` |
| Params | `date=YYYYMMDD`, `response=json` |
| Field mapping | See `StockPriceSyncService` for code, volume, open, high, low, close |
| Throttle | Retries exist per-day request; for backfill, run day-by-day with >=300ms interval (see `TwseDailyBackfillService`) |
| Failure behavior | Retry with exponential backoff up to 3 times; if still failed, throw for that date (backfill can resume from checkpoint) |

## Prisma Seed - TWSE Symbol Universe (`Stock` full-table upsert)

| Item | Description |
|------|-------------|
| Purpose | During `npm run db:seed`, align `Stock` with symbols covered by TWSE full-day market data |
| Data composition | 1) `STOCK_DAY_ALL` for latest available trading day symbol list. 2) `t187ap03_L` for listed company short names. 3) `t187ap05_L` for listed company sectors. 4) If symbol not in listed-company set (often ETF/product), classify by rules |
| Offline snapshot | Set `SEED_TWSE_LIST_PATH` to local JSON (see `resolveTwseSeedStocks` and `sample-universe.json`) to skip HTTP |
| Delisted symbols | Seed is upsert-only; does not delete old DB symbols to avoid breaking `StockPrice` foreign keys |
| Count validation | In online mode, `Stock` count should match `STOCK_DAY_ALL` data row count used in that run |

```sql
SELECT COUNT(*) AS n
FROM "Stock"
WHERE "market" = 'TWSE';
```

## Compliance Notes

- Do not hit official endpoints with high concurrency.
- Protect backfill endpoint in production (`DATA_SYNC_SECRET`).
- Requests include browser-like User-Agent; update if policy changes.

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `SYNC_ENABLED` | Enable schedulers when set to `true` |
| `DATA_SYNC_SECRET` | Required by header `x-data-sync-secret` for `POST /api/data-sync/backfill/prices` |
| `SEED_TWSE_LIST_PATH` | Optional local JSON source for seed, no TWSE/OpenAPI calls |

## Operations Notes (Backfill and Scheduler)

- Pause auto-sync: set `SYNC_ENABLED` to non-`true`.
- Long range backfill: run in small date windows.
- Failed dates appear in `failedDates`.
- Checkpoint only updates on successful days.
- Use `resume: true` to continue from the next date after last success.

Manual backfill example:

```bash
curl -sS -X POST "http://localhost:3000/data-sync/backfill/prices" \
  -H "Content-Type: application/json" \
  -H "x-data-sync-secret: YOUR_SECRET" \
  -d '{"fromDate":"2024-01-02","toDate":"2024-01-10","resume":false}'
```

If using Vite proxy, URL can be:

`http://localhost:5173/api/data-sync/backfill/prices`

Quick verification:

- Pick 5 continuous trading days.
- Verify `StockPrice` row counts and sampled values against TWSE source.

## Price Validation Flow (Single Symbol, Single Date)

Use this endpoint when a specific symbol/date looks suspicious:

```bash
curl -sS -X POST "http://localhost:3000/data-sync/validate/price" \
  -H "Content-Type: application/json" \
  -H "x-data-sync-secret: YOUR_SECRET" \
  -d '{"stockCode":"2330","date":"2026-04-26"}'
```

### Response fields

- `normalizedDate`: Date normalized in `Asia/Taipei`
- `isTradingDay`: Whether the date is a TWSE trading day
- `status`:
  - `MATCH`
  - `NOT_TRADING_DAY`
  - `MISSING_IN_DB`
  - `MISSING_IN_SOURCE`
  - `VALUE_MISMATCH`
  - `PARSE_ERROR`

### Example output (`2330` on `2026-04-26`)

```json
{
  "stockCode": "2330",
  "normalizedDate": "2026-04-26",
  "isTradingDay": false,
  "status": "NOT_TRADING_DAY",
  "reason": "Date is not a TWSE trading day (possible market holiday)",
  "dbClose": null,
  "sourceClose": null,
  "sourceFetchAt": "2026-04-27T06:30:00.000Z"
}
```

If status is `NOT_TRADING_DAY`, it is usually not a data anomaly.
