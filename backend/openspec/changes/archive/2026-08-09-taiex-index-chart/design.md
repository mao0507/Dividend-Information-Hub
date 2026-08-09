## Context

`StockPrice` 使用 `stockCode = 'TAIEX'` 儲存加權指數收盤點。每日 `syncDate` 呼叫 TWSE `MI_INDEX?date={date}&type=ALLBUT0999`，回應包含「價格指數」table，`parseTwseMiIndexTaiex` 可解出收盤值。

問題一：`querySourceFallbackRows`（`stock.service.ts`）對任何 code 都呼叫 `parseTwseMiIndexQuotes`（個股行情解析），TAIEX 不在個股清單中 → 回傳 `[]`。

問題二：`TwseDailyBackfillService` 存在且可逐日呼叫 `syncDate` 填入歷史資料，但尚未有方式從 API 手動觸發 TAIEX 回填，也無法查詢目前 DB 有幾筆 TAIEX 資料。

## Goals / Non-Goals

**Goals:**
- 修正 fallback：對 TAIEX code 改用 `parseTwseMiIndexTaiex` 回傳今日單點
- 新增 `GET /admin/data-sync/taiex-status`：回傳 DB 中 TAIEX 最早/最新日期與筆數
- 新增 `POST /admin/data-sync/taiex-backfill`：接受 `{ from, to }` 觸發歷史回填

**Non-Goals:**
- 不修改前端（Dashboard.vue 已完成）
- 不加 OHLC 高低點（MI_INDEX 指數 table 僅有收盤值，open/high/low 填相同值）
- 不增加 intraday 資料

## Decisions

### D1：fallback 修正方式

**選擇**：在 `querySourceFallbackRows` 加 `if (code === 'TAIEX')` 分支，呼叫 `parseTwseMiIndexTaiex`。

**替代**：將 TAIEX 移出 `StockPrice`，改用獨立 model。→ 過度工程，現有 model 已可容納。

### D2：回填觸發方式

**選擇**：Admin REST endpoint `POST /admin/data-sync/taiex-backfill`，由 `DataSyncController` 呼叫 `TwseDailyBackfillService.runRange(from, to)` 或直接在 controller 迴圈呼叫 `StockPriceSyncService.syncDate`。

**原因**：`TwseDailyBackfillService` 已有逐日 `syncDate` 邏輯，重用即可；不需新增 service class。

### D3：回填範圍限制

預設最多回填 **730 天**（約 2 年）以避免一次請求 timeout；前端不直接呼叫，屬 admin 操作。

## Risks / Trade-offs

- [TWSE rate limit] 大範圍回填（730 天 ≈ 520 個交易日）短時間內發大量請求 → 沿用既有 `fetchTwseMiIndexWithRetry` 指數退避，必要時加 `sleep` 間隔
- [open/high/low 精度] 指數 table 僅收盤值，open=high=low=close → K 線圖 body 為一橫線，視覺正確但不含實際高低點 → 可接受，後續有需求再改

## Migration Plan

1. 部署後執行 `POST /admin/data-sync/taiex-backfill?from=2023-01-01&to=today`（或 npm script）
2. 確認 `GET /admin/data-sync/taiex-status` 回傳筆數 > 0
3. 前端圖表自動顯示資料（無需 redeploy）

## Open Questions

- 回填時是否需要跳過已存在的日期（upsert 已處理，無需額外判斷）
- 是否需要 cron 自動補填（現有每日 `syncDate` 已處理，不需額外 cron）
