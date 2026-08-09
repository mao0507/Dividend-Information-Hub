## Context

`DashboardService.getSummary` 目前以 `new Date()` 去零化後當「今天」，再令 `weekEnd = today + 7 日`（仍為當日 00:00），並以 `exDate` 落在 `[today, weekEnd]` 的列計入「本週除息」。此與介面文案「本週」常見語意（日曆週、台北時區）可能不一致；且上界若為「第 7 天 00:00」會壓縮可納入的整日範圍。另伺服器若跑在 UTC，`setHours(0,0,0,0)` 以 UTC 午夜為準，與台灣使用者認知的「今天／本週」可能差一日。使用者回報本週（如 2026-04-29）多檔除息時小卡仍為 0，根因可能為上述區間、時區，或 DB 內無對應 `Dividend`（同步問題）；設計上須先讓「有資料時計數正確」可測。

## Goals / Non-Goals

**Goals:**

- 「本週除息」與「自選股本週除息」計數在 **Asia/Taipei** 下與**日曆週（週一至週日）**一致。
- 查詢邊界以該週首日 00:00:00.000 與末日 23:59:59.999（台北）轉成 Prisma 可比較的 `DateTime`（單一明確策略，避免半開區間誤解）。
- `count` 為區間內**不重複 `stockCode`**（與「檔」直覺一致）；`watchlistCount` 為該集合與使用者自選股代碼集合的交集筆數。
- 以單元測試固定時鐘或注入「參考現在」驗證邊界。

**Non-Goals:**

- 不強制本次修改 TWSE/FinMind 同步排程（若 DB 無列仍為 0，屬資料面，spec 區分驗收）。
- 不改前端四卡版面結構；除非 API 欄位擴充（預設不擴充）。

## Decisions

1. **週定義**：採 **ISO-週** 或 **地區週一至週日**？台股使用者習慣多為「週一～週日」與行事曆一致；**決定採 Asia/Taipei 之週一 00:00 至週日 23:59:59.999**（與台灣一週行事曆一致）。若需與 ISO week 對齊可後續再議；目前產品文案為「本週」而非「ISO week」。
2. **實作位置**：優先在 `dashboard.service.ts` 內抽出純函式 `getTaipeiWeekRange(reference: Date): { start: Date; end: Date }`（或重用專案既有 `stock-date`／calendar 工具若已有等價物），便於單測；避免散落魔術數字。
3. **「今日除息」**：一併改為以 **Asia/Taipei** 的日界線計算 `[當日 00:00, 當日 23:59:59.999]`，與「本週」同一時區基準，避免一卡用本地一卡用 UTC。
4. **與舊行為差異**：由「滑動 7 日窗」改為「日曆週」會改變數字；視為修正而非向後相容模擬舊錯誤。

## Risks / Trade-offs

- **[Risk] 週定義與少數使用者預期不同**（例如想要「未來 7 天」）→ 文案維持「本週除息」並在 spec 寫死日曆週；若需兩種模式可列 Open Question。
- **[Risk] 第三方函式庫時區行為** → 以單測固定 `reference` 與已知 `exDate` UTC 儲存格式驗證；避免僅手動測。
- **[Risk] DB 仍無資料** → 計數正確仍為 0；營運上需同步股息資料；設計不混為「假造檔數」。

## Migration Plan

- 僅邏輯變更，無 schema migration。部署後儀表板數字可能與舊版不同（預期行為）。
- Rollback：還原 `dashboard.service.ts` 與測試檔。

## Open Questions

- 產品是否要求與「行事曆頁」同一資料源（同一 Prisma 查詢條件）？若行事曆另有篩選（僅上市櫃等），是否本卡應對齊；建議實作時 grep `calendar` 服務並在 tasks 註記對齊檢查。
