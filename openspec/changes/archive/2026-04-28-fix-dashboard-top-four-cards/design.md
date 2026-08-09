## Context

目前 Dashboard 上方四個統計區塊與 Hero 報價雖然同頁呈現，但資料時間基準與缺值策略分散在不同邏輯，導致「卡片顯示可用、Hero 已過期」或「資料缺漏時顯示 0 造成誤讀」等問題。此變更需要把四區塊與 Hero 的資料新鮮度判斷收斂成可測試的共用規則，並以最小改動完成。

## Goals / Non-Goals

**Goals:**
- 定義四個統計區塊的統一資料契約（值、單位、狀態、資料時間）。
- 定義缺值與失敗時的顯示規則，避免用 `0` 假裝有資料。
- 與既有 Hero 報價能力對齊同一 `asOf`（資料時間）與 freshness 判斷。
- 以 utility/composable 層封裝轉換，讓頁面元件只負責渲染。
- 補齊單元測試，覆蓋完整、部分、失敗三種資料狀態。

**Non-Goals:**
- 不改動後端資料模型與資料同步流程。
- 不新增新的外部 API 供應商。
- 不重做 Dashboard 視覺設計，只處理四區塊資料正確性與文案。

## Decisions

1. **建立前端卡片資料映射層（formatter）**
   - 決策：新增 `DashboardTopCards` 專用 mapping 函式，輸入 API raw payload，輸出統一 UI model。
   - 原因：把「資料正確性」從元件模板拆出，可獨立測試，避免模板內散落判斷。
   - 替代方案：直接在 `DashboardPage.vue` computed 內處理；缺點是可讀性與測試性差。

2. **缺值一律採中性顯示，不以 0 假資料填補**
   - 決策：對缺資料卡片回傳 `displayValue = '--'` 與 `state = 'empty'|'stale'|'error'`。
   - 原因：`0` 在金融情境有明確意義，不能當缺值 placeholder。
   - 替代方案：沿用目前 `0`；缺點是會誤導為真實數值。

3. **Hero 與四卡共用資料時間基準**
   - 決策：四卡與 Hero 需共用同一個 `asOf` 來源（同次載入結果）；若 freshness 驗證失敗則全部進入中性狀態。
   - 原因：同屏資訊要可互相驗證，避免一塊是 T 日、一塊是 T-2 日。
   - 替代方案：各自獨立抓取；缺點是時間漂移造成矛盾。

4. **採增量變更，不引入新依賴**
   - 決策：僅使用既有 Vue/TS 能力，不新增狀態管理或格式化套件。
   - 原因：降低回歸風險，快速修復目前決策風險。

## Risks / Trade-offs

- **[Risk] API 欄位在部分情境缺少 `asOf`** → **Mitigation**：若缺少則標記 stale，不顯示誤導值。
- **[Risk] 舊測試 fixture 與新資料契約不相容** → **Mitigation**：同步更新 fixture，按 `complete/partial/error` 分類。
- **[Risk] 短期內文案改動影響既有截圖比對** → **Mitigation**：將文案變更限定在四區塊，並更新對應 snapshot。

## Migration Plan

1. 新增資料映射函式與型別（不接頁面）。
2. 補齊映射層測試（先測行為再接 UI）。
3. `DashboardPage.vue` 改用新 mapping 輸出四卡資料。
4. 對齊 Hero 與四卡共用 `asOf/freshness` 判斷。
5. 跑前端單測與頁面驗證，確認四區塊在缺值時不顯示誤導數值。

Rollback:
- 若上線後異常，回退 `DashboardPage.vue` 對 mapping 的引用與對應 utility 變更即可，資料層不受影響。

## Open Questions

- 四區塊缺值文案是否統一為 `--`，或需按卡片語意拆為不同文案（例如「暫無資料」）？
- freshness 容忍窗口是否固定（例如 1 交易日），或按資料種類分級？
