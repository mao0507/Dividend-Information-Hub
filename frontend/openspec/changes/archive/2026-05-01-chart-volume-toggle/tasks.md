## 1. 型別與 Store

- [x] 1.1 `frontend/src/types/index.ts`：`TweakSettings` 新增 `showVolume: boolean`
- [x] 1.2 `frontend/src/stores/tweaks.ts`：`defaults` 新增 `showVolume: true`

## 2. TvChart 整合

- [x] 2.1 `TvChart.vue`：新增 `watch(() => tweaksStore.settings.showVolume, applyVolumeVisibility)` 監聽
- [x] 2.2 實作 `applyVolumeVisibility(show: boolean)`：
  - `show = false`：`volSeries?.applyOptions({ visible: false })`，`chart.priceScale('right').applyOptions({ scaleMargins: { top: 0.05, bottom: 0.05 } })`
  - `show = true`：`volSeries?.applyOptions({ visible: true })`，`chart.priceScale('right').applyOptions({ scaleMargins: { top: 0.05, bottom: 0.25 } })`
- [x] 2.3 `initChart` 函式末尾呼叫 `applyVolumeVisibility(tweaksStore.settings.showVolume)`，確保初始化時套用當前設定

## 3. TweaksPanel UI

- [x] 3.1 `TweaksPanel.vue`：在「漲跌色」區塊下方新增「圖表」區塊
- [x] 3.2 新增成交量開關，沿用 pill button 樣式，選項：`顯示` / `隱藏`，對應 `tweaks.setTweak('showVolume', true/false)`

## 4. 驗收

- [x] 4.1 執行 `pnpm test` 確認所有測試通過
- [ ] 4.2 手動驗證：TweaksPanel 切換開關，圖表成交量顯隱正確，K 線高度隨之調整
