## Context

目前專案已有 `Holding` 彙總資料，但缺少可追溯的買入 lot 明細，導致使用者無法檢視每筆買入時間、成本與數量，也無法用一致口徑計算「從買入時間開始的已獲得除息收入」。此外，前端缺少以投資成本（非市值）為基礎的持有比重視覺化，無法直觀看到資金配置。

## Goals / Non-Goals

**Goals:**
- 新增可持久化的買入 lot 明細資料模型，並與既有 `Holding` 彙總保持一致更新。
- 提供持股管理 API：新增 lot、查詢彙總與明細、取得投資金額占比資料。
- 建立前端持股管理頁面：含輸入表單、彙總列表、可展開 lot 明細與圓餅圖。
- 定義已獲得除息收入計算口徑：以每筆 lot 的買入時間作為納入起點。

**Non-Goals:**
- 不處理賣出交易與 realized P/L（本次僅買入累積）。
- 不實作配息基準日持股快照回溯引擎（採 MVP 買入日起算）。
- 不更動既有 watchlist 與 alert 的核心資料流程。

## Decisions

1. **使用雙層資料模型：`HoldingLot` + `Holding`**
   - 決策：新增 `HoldingLot` 保存每筆買入；`Holding` 保留為彙總快取（shares、avgCost、boughtAt、earnedDividend）。
   - 理由：同時滿足「可展開明細」與「高頻彙總查詢」需求，避免每次列表都全量聚合。
   - 替代方案：僅保留 lot 並動態聚合。未採用原因：查詢成本增加且需在多處重複聚合邏輯。

2. **lot 新增／刪除時同步重算 `Holding`**
   - 決策：`POST /holdings/lots` 與 `DELETE /holdings/lots/:id` 在同一服務流程內先寫／刪 lot，再重算對應 Holding（shares、avgCost、boughtAt、earnedDividend）。刪除最後一筆 lot 時連帶刪除 Holding。
   - 理由：確保彙總與明細一致，避免延遲同步造成顯示不一致。
   - 替代方案：背景任務異步重算 holding。未採用原因：一致性延遲會影響即時 UI。

3. **已獲得除息收入採 lot 基礎累加，快取於 `Holding.earnedDividend`**
   - 決策：每筆 lot 計算 `sum(dividend.cash * lot.shares)`，條件為 `filled=true` 且 `payDate>=buyDate`；結果快取至 `Holding.earnedDividend`，由兩個觸發點維護：① lot 新增／刪除時同步重算該 stockCode 的 holding；② `DividendFillTracker` 每日 16:00 跑完後，對所有 holdings 執行 batch 重算（單一 JOIN SQL）。
   - 理由：`GET /holdings` 維持 O(1) 讀取，不因持倉增加而變慢；觸發點可控且有界。
   - 替代方案：每次 GET /holdings 即時計算。未採用原因：filled 狀態由排程更新，即時計算等於每次讀都在跑全表 JOIN。

4. **MVP 支援刪除 lot**
   - 決策：新增 `DELETE /holdings/lots/:id`，刪除後重算 Holding 彙總；最後一筆 lot 刪除時連帶刪除 Holding（不保留 shares=0 殘影）。本次不實作 PATCH（修正 lot）。
   - 理由：輸入錯誤是必然場景，不提供刪除會讓除息收入計算永久失真，影響可用性。
   - 替代方案：僅 MVP 後補刪除。未採用原因：已決議此為 MVP 必要功能。

5. **投資比重以成本基礎（buyPrice * shares）呈現，百分比由前端計算**
   - 決策：`GET /holdings/allocation` 回傳 `{ stockCode, name, totalCost }[]`，前端自行計算各項占比。
   - 理由：保持 API 語意單純，百分比是展示邏輯，不應由後端決定。
   - 替代方案：後端計算 percentage 回傳。未採用原因：顯示邏輯（如單檔 100% 的邊界處理）屬前端責任。

## Risks / Trade-offs

- **[風險] 只記錄買入不記錄賣出，持股與實際部位可能偏離** → **Mitigation**：在 API 與 UI 文案明確標示目前為買入累積模型。
- **[風險] dividend `cash` 欄位語意若非每股，會放大計算誤差** → **Mitigation**：在 spec 與測試固定為「每股股利」假設，並加上契約驗證。
- **[取捨] lot 新增／刪除同步重算 `Holding` 增加寫入路徑複雜度** → **Mitigation**：集中在 holdings service 單一入口實作並以單元測試覆蓋（特別是 avgCost 加權重算與最後 lot 刪除路徑）。
- **[取捨] `DividendFillTracker` 新增 batch 重算步驟，拉長排程執行時間** → **Mitigation**：batch 重算以單一 JOIN SQL 完成，預期對持倉規模在百筆以內的使用者影響可忽略。

## Migration Plan

1. 新增 `HoldingLot` schema 與 migration；同步在 `Holding` 新增 `earnedDividend` 欄位。
2. 新增 holdings module（controller/service/dto）並註冊至 app module。
3. 實作 lot 新增（POST）與刪除（DELETE），每次操作後同步重算 Holding 彙總（含 earnedDividend）。
4. 實作 `GET /holdings`（彙總＋明細）與 `GET /holdings/allocation`（totalCost，不含 percentage）。
5. 在 `DividendFillTracker` 末尾新增 batch 重算所有 holdings.earnedDividend 的步驟。
6. 新增前端 holdings API、路由與頁面，接上表單/列表/圓餅圖（前端計算 percentage）。
7. 補齊後端與前端測試，跑 targeted tests 與 lint。

## Open Questions

- 已決議：MVP 支援刪除 lot（Decision 4），不支援修正（PATCH），留待後續 change。
