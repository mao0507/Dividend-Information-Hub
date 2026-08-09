## 1. 修正 TAIEX Fallback 邏輯

- [x] 1.1 在 `stock.service.ts` 的 `querySourceFallbackRows` 加入 `if (code === 'TAIEX')` 分支，呼叫 `parseTwseMiIndexTaiex` 取得今日收盤值
- [x] 1.2 若 `parseTwseMiIndexTaiex` 回傳 `null`，回傳 `[]`；否則組成單筆 candle（open=high=low=close）回傳
- [x] 1.3 為 `querySourceFallbackRows` TAIEX 分支補充 unit test（TWSE 成功 / TWSE 回傳 null）

## 2. 新增診斷端點

- [x] 2.1 在 `DataSyncController` 新增 `GET /admin/data-sync/taiex-status` handler
- [x] 2.2 查詢 `prisma.stockPrice.aggregate`，回傳 `{ count, earliest, latest }`
- [x] 2.3 補充 integration test：有資料與無資料兩個 scenario

## 3. 新增歷史回填端點

- [x] 3.1 在 `DataSyncController` 新增 `POST /admin/data-sync/taiex-backfill` handler，接受 query param `from`、`to`
- [x] 3.2 驗證日期格式（YYYY-MM-DD）及範圍 ≤ 730 天，非法時回 HTTP 400
- [x] 3.3 迴圈呼叫 `stockPriceSync.syncDate(day)` for each calendar day in [from, to]，累計 `upserted` 與 `skipped`
- [x] 3.4 回傳 `{ upserted, skipped, from, to }`
- [x] 3.5 補充 unit test：範圍超限 400、日期格式錯誤 400、正常流程回傳正確統計

## 4. 驗證端對端資料流

- [x] 4.1 確認 seed 已建立 `Stock { code: 'TAIEX' }`（`prisma db seed` 執行成功）
- [x] 4.2 呼叫 `POST /admin/data-sync/taiex-backfill?from=2024-01-01&to=today` 回填資料
- [x] 4.3 呼叫 `GET /admin/data-sync/taiex-status` 確認 `count > 0`
- [x] 4.4 呼叫 `GET /stock/TAIEX/price-series?range=6M` 確認回傳 candle 陣列非空
- [x] 4.5 在瀏覽器開啟 Dashboard，確認 TAIEX 圖表正常顯示 K 線
