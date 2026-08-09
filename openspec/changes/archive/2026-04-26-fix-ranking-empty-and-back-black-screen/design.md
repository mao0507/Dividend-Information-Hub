## Context

目前 `RankingPage` 在 API 失敗時會把資料清空，但畫面缺少可行動的空狀態與錯誤回饋，使用者會感知為「沒內容」。同時存在「切回前一頁畫面變黑」現象，推測與路由切換後渲染狀態未恢復、或錯誤被靜默吞掉有關。此問題影響核心瀏覽流程，需優先補齊頁面韌性與導航穩定性。

## Goals / Non-Goals

**Goals:**
- Ranking 在「無資料 / 載入失敗」時顯示明確空狀態（含重試）。
- 修正返回上一頁時黑屏，確保頁面可正常回復渲染。
- 建立可驗證的回歸測試（至少涵蓋 Ranking 空資料與 back navigation）。

**Non-Goals:**
- 不重做 Ranking 視覺設計與篩選體驗。
- 不在本次調整排行演算法或資料來源商業邏輯。
- 不新增第三方錯誤監控服務。

## Decisions

1. **Ranking 採明確 UI 狀態機**
   - 狀態拆分為 `loading / ready / empty / error`，避免只有 `rows.length` 判斷。
   - 理由：可明確渲染對應畫面與操作（例如重試）。
   - 替代：沿用現狀只在 catch 清空資料。缺點是使用者無法理解當下狀態。

2. **錯誤可見化，不允許靜默失敗**
   - API 錯誤時顯示 inline error message（或 toast）並提供 retry。
   - 理由：黑屏通常源於無回饋錯誤；可見化可快速定位與降低體感故障。

3. **返回黑屏以路由生命週期安全策略處理**
   - 返回時重新觸發必要資料載入或重建關鍵狀態，避免殘留中間態。
   - 若發現是 layout/router guard 問題，修正 guard 的 fallback 導向與錯誤處理。

## Risks / Trade-offs

- **[Risk] 空狀態與錯誤狀態混淆** → 以明確文案區分「真的沒資料」與「載入失敗」。
- **[Risk] 修正 back navigation 影響其他頁面** → 加上跨頁回歸測試（Dashboard ↔ Ranking）。
- **[Risk] 重新載入策略增加 API 呼叫** → 僅在必要路由切換時觸發，避免重複請求。

## Migration Plan

1. 先在 `RankingPage` 建立狀態機與空/錯誤畫面。
2. 補 retry 機制與返回頁黑屏修復。
3. 增加測試案例（ranking empty + back navigation）。
4. 手動驗證：Ranking 無資料、切到個股再返回、切回前頁不黑屏。
5. 若產生回歸，先回滾路由生命週期相關調整，再保留空狀態改動。

## Open Questions

- 黑屏是否只發生在特定路徑（Ranking → StockDetail → Back），或任意回上一頁都會發生？
- API 回傳空資料是否需區分「篩選過嚴」與「服務異常」兩種文案？
