## Why

行事曆五月份（2026-05）除息資料幾乎空白，原因：

1. `DividendSyncService` 只回查過去 35 天（TWT49U 結果表），未取得**未來**除息公告
2. TWSE 提供另一表 **TWT48U**（除息除權公告）含未來預定除息日，目前未使用
3. `freq` 欄位寫死 `'annual'`，月配/季配 ETF 標示錯誤，行事曆頻率篩選失效
4. `payDate` 永遠 null，發放日事件從未出現在行事曆

## What Changes

- **新增 TWT48U 公告同步服務** (`TwseDividendAnnouncementSyncService`)
  - 查詢 TWSE TWT48U 取得未來 90 天已公告除息日期與金額
  - 結果 upsert 進 `Dividend` 資料表（exDate 可為未來日期）
- **DividendSyncService**：現有 35 天回查保留，同步後追加呼叫 TWT48U sync
- **`freq` 推算**：根據同一股票年內配息次數推算頻率（1→annual、2→semi-annual、4→quarterly、12→monthly）
- **`DividendHistoryBackfillService`**：回填完成後對 2018 年以後資料批次修正 freq

## Capabilities

### New Capabilities
（無新 spec 層級能力，為資料品質 bug fix）

### Modified Capabilities
（無 spec 層級需求變更）

## Impact

- `backend/src/data-sync/dividend-sync.service.ts` — 主要修改
- `backend/src/data-sync/` — 新增 `twse-announcement-sync.service.ts`
- `backend/src/data-sync/dividend-history-backfill.service.ts` — 補 freq 批次修正
- `backend/src/data-sync/data-sync.module.ts` — 注入新服務
- `backend/src/data-sync/data-sync.controller.ts` — 新增手動觸發端點
