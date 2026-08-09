## Context

TWSE 提供兩張表：
- **TWT49U**（除息除權結果）：只含已執行完成的過去除息日，`startDate/endDate` 查詢。
- **TWT48U**（除息除權公告）：含已公告但尚未執行的**未來**除息日，同樣支援日期範圍查詢。

`DividendSyncService.syncAll()` 只查 TWT49U 過去 35 天，導致整個月的未來公告缺漏。
`freq` 欄位在所有同步路徑均寫死 `'annual'`，無法反映 ETF 實際配息頻率。

## Goals / Non-Goals

**Goals:**
- 行事曆能顯示未來 90 天的已公告除息日
- `freq` 欄位正確反映配息頻率（年配/半年/季配/月配）
- 不影響現有 TWT49U 同步邏輯

**Non-Goals:**
- 不同步 `payDate`（TWSE 公開資料不提供）
- 不支援 TPEX 公告（TPEx 無等效 API）
- 不修改 FinMind 路徑（頻率推算另行處理）

## Decisions

### 1. TWT48U 公告同步服務

新增 `TwseDividendAnnouncementSyncService`，在 `DividendSyncService.syncAll()` 結束後呼叫：

```ts
// URL: https://www.twse.com.tw/rwd/zh/exRight/TWT48U?startDate=YYYYMMDD&endDate=YYYYMMDD&response=json
// 查詢今天 → 今天 + 90 天
```

TWT48U 欄位（依 TWSE 文件）：
- `row[0]` 除息日期（民國）
- `row[1]` 股票代號
- `row[2]` 股票名稱
- `row[4]` 除息值（現金）
- `row[6]` 類型（含「息」字）

與 TWT49U 欄位佈局相同，可共用 `parseRocDate` / `upsertRows` 邏輯。

### 2. `freq` 推算

新增 `inferFreq(yearlyCount: number): string` 純函式：

```ts
const inferFreq = (count: number): string => {
  if (count >= 10) return 'monthly'
  if (count >= 3)  return 'quarterly'
  if (count >= 2)  return 'semi-annual'
  return 'annual'
}
```

在 upsert 時，先查該股票當年已有多少筆 → `period` 決定了 yearlyCount → 推算 freq。

**問題**：第一筆進來時 period=1，count=1 → annual，之後更新不會修正 freq。
**解法**：backfill 完成後執行 `batchFixFreq()`，對每支股票統計年配息次數並批次 UPDATE。

### 3. 新端點（手動觸發）

```
POST /data-sync/sync-dividend-announcements
```

需 `x-data-sync-secret` header。非同步執行，供 Cloudflare Worker 排程呼叫。

## Risks / Trade-offs

- TWT48U 欄位偏移未經實際驗證 → `AnnouncementSyncService` 加欄位 guard，任一欄位異常則略過該列並 log。
- `freq` 批次修正跑在 backfill 後，可能執行時間長 → 非同步、可獨立 trigger。
- 公告資料的 `cash` 值在結果公告後可能微調 → TWT49U 仍會 update，upsert 覆蓋即可。
