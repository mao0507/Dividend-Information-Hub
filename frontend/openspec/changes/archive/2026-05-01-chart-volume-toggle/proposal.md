## Why

成交量子圖佔用圖表底部 20% 空間，在小螢幕或只需關注價格走勢的場景下會造成視覺干擾。允許使用者自行開關成交量顯示，能在保留功能的同時提升圖表可讀性。

## What Changes

- `TweakSettings` 新增 `showVolume: boolean` 欄位（預設 `true`）
- `tweaks` store `defaults` 加入 `showVolume: true`
- `TvChart.vue` 監聽 `tweaks.settings.showVolume`：`false` 時隱藏 `volSeries`（移除子圖），`true` 時還原
- Settings/Tweaks UI 新增「成交量」開關（與 `upRed` 同區塊）

## Capabilities

### New Capabilities
（無）

### Modified Capabilities
- `tv-chart`：成交量子圖新增「可由使用者關閉」的需求，原規格僅描述「始終顯示」

## Impact

- `frontend/src/types/index.ts` — `TweakSettings` 新增欄位
- `frontend/src/stores/tweaks.ts` — defaults 新增 `showVolume`
- `frontend/src/components/chart/TvChart.vue` — 監聽 showVolume 顯隱 volSeries
- Settings / Tweaks UI 元件 — 新增開關 UI
