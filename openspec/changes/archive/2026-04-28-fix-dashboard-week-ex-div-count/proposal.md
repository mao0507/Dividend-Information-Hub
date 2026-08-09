## Why

儀表板「本週除息」小卡在實際市場本週仍有多檔除息時顯示 **0 檔**，與使用者從行事曆或公開資訊觀測到的狀況不一致，導致無法依賴該指標安排觀察或操作。需在後端計數邏輯與「本週」語意上對齊台灣使用者預期，並可驗證。

## What Changes

- 明確定義「本週除息」的日曆區間（建議：以 **Asia/Taipei** 之 **週一至週日** 為一週，與多數行事曆一致；與目前「自今日起往後 7 日」若不同則改為日曆週）。
- 修正 `exDate` 查詢上下界：納入區間內整日（例如週日 23:59:59.999 或日期-only 語意），避免 `weekEnd` 僅設為「第 N 天 00:00」導致最後一日被裁掉或與 UTC/本地混用造成整日偏移。
- 計數規則：同一股票多筆除息於同一區間內是否去重，需與產品文案「檔」一致（通常為 **不重複股票代號**）。
- 自選股交集計數與全體計數使用相同時間窗與去重規則。
- 補上 `DashboardService`（或抽出之純函式）單元測試：固定「今天」與種子 `exDate`，覆蓋跨週、邊界日、夏令時間不適用但時區仍為台北等案例。

## Capabilities

### New Capabilities

- `dashboard-week-ex-div-count`: 定義 Dashboard「本週除息」全體檔數與自選股檔數的時間範圍、時區、查詢邊界與去重規則，使 API 計數與使用者對「本週」的理解一致。

### Modified Capabilities

- （無）— 根目錄 `openspec/specs/` 尚無專責「四卡」之全域 spec；本 change 以新 capability 承載需求。

## Impact

- **後端**：`backend/src/dashboard/dashboard.service.ts`（主要）、可能新增日期區間工具（專案內既有日曆工具則重用）。
- **測試**：`backend/src/dashboard/dashboard.service.spec.ts`（若無則新增）或對應 e2e 最小案例。
- **前端**：僅在 API 契約變更時調整型別或文案；預期仍為 `weekExDiv.count` / `watchlistCount`，欄位名不變為佳。
- **資料**：不依賴新表；若計數仍為 0 且 DB 確無該週 `Dividend` 列，則屬同步/種子問題，本 change 之 spec 應區分「計算正確但 DB 無資料」與「計算錯誤」之驗收場景。
