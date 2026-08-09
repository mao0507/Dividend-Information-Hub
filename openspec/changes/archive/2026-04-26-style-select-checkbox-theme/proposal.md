## Why

目前畫面中的 `select` 與 `checkbox` 視覺樣式和主題系統不一致，包含邊框、背景、focus 狀態、勾選色彩與文字層級，造成介面觀感破碎。此調整需要現在進行，才能在後續頁面擴充時維持一致的主題體驗與可讀性。

## What Changes

- 建立 `select` 與 `checkbox` 在全站一致的主題樣式規範（預設、hover、focus、disabled、checked）。
- 套用到現有主要頁面與篩選區塊，移除不符合主題的樣式落差。
- 確保深色背景、文字對比與互動狀態清楚，避免「看起來像未啟用」或「勾選不明顯」問題。
- 補上驗收與測試案例，確保元件狀態變化不回歸。

## Capabilities

### New Capabilities
- `themed-select-checkbox`: 定義並落地 `select` 與 `checkbox` 的主題一致化樣式與互動行為。

### Modified Capabilities
無

## Impact

- 預期影響檔案：
  - `frontend/src/pages/RankingPage.vue`（篩選 `select`、`checkbox`）
  - `frontend/src/pages/WatchlistPage.vue` / `frontend/src/pages/DashboardPage.vue`（若有共用輸入控制項）
  - `frontend/src/components/**`（若抽出共用 styled control）
  - `frontend/src/assets` 或主題樣式檔（若集中管理樣式 token）
- API 與後端不受影響。
- 不新增第三方依賴，沿用既有 Vue + Tailwind/主題變數。
