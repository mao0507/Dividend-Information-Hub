## Context

`TvChart.vue` 目前成交量子圖（`volSeries` histogram）為固定顯示。tweaks store 已存在其他圖表視覺設定（`upRed`、`accent`），`showVolume` 自然延伸至此。`TweaksPanel.vue` 是 tweaks 設定的統一入口。

## Goals / Non-Goals

**Goals:**
- 使用者可在 TweaksPanel 切換成交量子圖顯示/隱藏
- 設定持久化（存於 tweaks store，與其他設定一致）
- 隱藏時成交量區域收縮，K 線圖佔用更多高度

**Non-Goals:**
- 個別圖表獨立設定（全域開關即可）
- 成交量數值顯示方式調整

## Decisions

**使用 lightweight-charts `visible` option 而非移除 series**
`volSeries.applyOptions({ visible: false })` 不需重建 series，切換開關時無閃爍。同時調整 `priceScale('right')` 的 `scaleMargins.bottom`：
- 顯示時：`bottom: 0.25`（現有值）
- 隱藏時：`bottom: 0.05`（K 線向下延伸）

**`showVolume` 加入 `TweakSettings`，不加 prop**
圖表 prop 適合「per-usage」控制；全域偏好設定（如 upRed）存 store。成交量開關為使用者偏好，走 store。

**TweaksPanel UI 沿用現有按鈕樣式**
在「漲跌色」區塊下方新增「圖表」區塊，使用與 upRed 相同的 pill button 樣式，選項：`顯示` / `隱藏`。

## Risks / Trade-offs

`volSeries.applyOptions({ visible: false })` 在 lightweight-charts v4 有效；若未來升版須確認 API 相容性。→ 低風險，為標準 API。
