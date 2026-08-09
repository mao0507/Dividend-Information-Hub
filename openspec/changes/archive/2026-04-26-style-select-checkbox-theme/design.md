## Context

目前專案內 `select` 與 `checkbox` 呈現在不同頁面採用不同 class，導致邊框強度、背景色、focus ring、disabled 狀態與勾選色不一致。既有 `USelect` 已存在，但部分頁面仍直接使用原生 `select` 與 `checkbox`，造成主題一致性不足。此變更需要在不影響功能邏輯的前提下，優先統一互動視覺層。

## Goals / Non-Goals

**Goals:**
- 定義並落地 `select`/`checkbox` 的主題樣式基準（default、hover、focus、checked、disabled）。
- 優先修正高使用區域（如設定頁、提醒頁）讓控制項外觀與主題一致。
- 保持可讀性與互動辨識度，避免深色背景下狀態不明顯。
- 以低風險方式實作，可逐步套用且可回歸驗證。

**Non-Goals:**
- 不調整表單資料結構或 API。
- 不重做整體設計系統與所有輸入元件。
- 不新增第三方 UI 套件。

## Decisions

1. **以共用樣式來源集中控制 `select` 與 `checkbox`**
   - 決策：在 `USelect` 與共用 class（或共用小元件）集中主題樣式，頁面直接使用一致 class。
   - 理由：避免每頁各自維護造成漂移。
   - 替代方案：逐頁就地硬改 class。缺點是後續維護成本高，容易再次分裂。

2. **狀態樣式明確分層**
   - 決策：每個控制項明確定義 `default -> hover -> focus-visible -> disabled`，checkbox 另加 `checked` 視覺規則。
   - 理由：讓使用者快速理解元件狀態，並符合現有主題語意（`surface`、`border`、`accent`）。
   - 替代方案：僅修改預設顏色。缺點是互動狀態仍不一致。

3. **先改高影響頁，再擴散**
   - 決策：第一階段先覆蓋 `SettingsPage` 與 `AlertsPage` 的原生表單控制項，再視情況擴到其他頁面。
   - 理由：這兩頁有最多 `select/checkbox`，可快速驗證效果。
   - 替代方案：全專案一次性改完。缺點是回歸面太大。

## Risks / Trade-offs

- **[Risk] 各頁面 class 差異過大，套用共用樣式可能破版**  
  **Mitigation**：先以兩頁試點，透過簡單 smoke 測試確認排版後再擴散。

- **[Risk] checkbox 新樣式在不同瀏覽器呈現差異**  
  **Mitigation**：使用較保守的原生外觀覆寫方式，並以 Chromium 為基準驗證。

- **[Risk] 只改樣式但漏掉 disabled/focus 狀態**  
  **Mitigation**：在 spec 與 tasks 強制列出狀態驗收項目。

## Migration Plan

1. 建立/整理 `select`、`checkbox` 共用主題 class。
2. 套用至 `SettingsPage` 與 `AlertsPage`。
3. 更新或新增測試（至少驗證 class 與狀態切換）。
4. 執行手動驗收（hover/focus/checked/disabled）。
5. 若出現回歸，先回滾單頁樣式變更，保留共用樣式基礎。

## Open Questions

- 是否要將 checkbox 抽成共用 `UCheckbox` 元件，還是先用共用 class 即可？
- 是否需要同步更新 `OnboardingPage` 的表單控制項，作為第一階段範圍？
