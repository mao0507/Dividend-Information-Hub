## 1. 新增 TWT48U 公告同步服務

- [x] 1.1 建立 `backend/src/data-sync/twse-announcement-sync.service.ts`
  - `@Injectable()` class `TwseDividendAnnouncementSyncService`
  - `sync(lookAheadDays = 90)` 方法：查詢今天到今天 + 90 天的 TWT48U
  - 欄位解析同 TWT49U：`row[0]`=除息日、`row[1]`=代號、`row[4]`=息值、`row[6]`=類型
  - 任一欄位異常略過並 warn log
  - 呼叫 `DividendSyncService.upsertRows()` 共用 upsert 邏輯（或自行 upsert）
- [x] 1.2 在 `DividendSyncService.syncAll()` 結束後呼叫 announcement sync
- [x] 1.3 在 `data-sync.module.ts` 注入 `TwseDividendAnnouncementSyncService`

## 2. freq 推算

- [x] 2.1 新增 `inferFreq(yearlyCount: number): string` 純函式於 `twse-announcement-sync.service.ts`（>=10→monthly, >=3→quarterly, >=2→semi-annual, else annual），export 供共用
- [x] 2.2 `DividendSyncService.upsertRows()`：create 新紀錄時改用 `inferFreq(period)` 取代寫死 `'annual'`
- [x] 2.3 `DividendHistoryBackfillService.upsertDividend()`：同步修改，create 時用 `inferFreq(period)`
- [x] 2.4 新增 `batchFixFreq()` 方法於 `DividendHistoryBackfillService`（使用 Prisma groupBy）
- [x] 2.5 `DividendHistoryBackfillService.backfill()` 完成後呼叫 `batchFixFreq()`

## 3. 新增控制器端點

- [x] 3.1 `data-sync.controller.ts`：新增 `POST /data-sync/sync-dividend-announcements`
  - 需 `x-data-sync-secret` header
  - 非同步呼叫 `TwseDividendAnnouncementSyncService.sync()`
  - 回傳 `{ message, lookAheadDays }` with 202

## 4. 驗收

- [x] 4.1 執行 `pnpm test` 確認無回歸（backend 125/125 passed）
- [ ] 4.2 手動呼叫 `POST /data-sync/sync-dividend-announcements` 並確認 DB 有五月份除息資料
- [ ] 4.3 行事曆五月份顯示正確除息事件且金額 > 0
- [ ] 4.4 驗證月配 ETF（如 0056）的 `freq` 修正為 `quarterly`（年配 4 次）
