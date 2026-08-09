## Context

現有 `StockChart.vue` 以純 SVG 手寫折線圖實作，只接受 `series: number[]`（收盤價陣列），缺乏燭台、成交量、原生縮放/拖曳功能。後端 `GET /stocks/:code/price` 已回傳 `{ date, open, high, low, close, volume }` 完整 OHLCV，但前端只取 `close`。

目標是以 TradingView `lightweight-charts`（MIT，官方開源）替換 SVG 實作，在不改後端 API 的前提下，用最少改動完成升級。

## Goals / Non-Goals

**Goals:**
- K 線燭台圖（OHLCV），上漲下跌顏色跟隨 `upRed` 設定
- 成交量子圖（60px 高度分格，與 K 線主圖共享 x 軸）
- 除息日垂直標記線（對應 `Dividend.exDate`）
- 游標 Crosshair + tooltip 顯示 OHLCV 詳情
- 響應式寬度（container resize 時重新 fit）
- 深色主題與設計系統 CSS 變數對齊（`--color-surface`、`--color-border` 等）

**Non-Goals:**
- 即時報價 WebSocket 串流
- 多股票疊加比較
- 圖表指標（MACD、RSI 等）
- `SparkLine.vue` 替換（小型迷你圖維持現有 SVG）

## Decisions

### D1：使用 `lightweight-charts` v4 而非 ECharts / ApexCharts / Highcharts

`lightweight-charts` 是 TradingView 官方 MIT 套件，bundle 小（gzip ~35 KB），API 專為金融時序設計，內建 Crosshair/時區/缺口處理。ECharts 功能完整但 bundle 大（gzip ~300 KB）；ApexCharts、Highcharts 商業授權或費用問題。

### D2：新建 `TvChart.vue` 而非改寫 `StockChart.vue`

`StockChart.vue` 在測試中有 spec 檔，直接改寫會中斷現有測試。建立新元件可安全並行，確認可用後再移除舊元件，降低風險。

### D3：Props 設計

```ts
interface TvChartProps {
  candles: OhlcvPoint[]         // OHLCV 主資料
  exDates?: string[]            // 除息日期（ISO date string 陣列）
  height?: number               // 預設 320px
  upColor?: string              // 預設跟隨 tweaks.upRed
}

interface OhlcvPoint {
  date: string   // 'YYYY-MM-DD'
  open: number
  high: number
  low: number
  close: number
  volume: number
}
```

改用 `candles: OhlcvPoint[]` 取代舊有 `series: number[]`，讓 pages 直接傳入 API 回傳的 price 陣列（只需 type cast）。

### D4：主題對齊方式

`lightweight-charts` 支援完整 `ChartOptions` 主題設定。於 `onMounted` 時讀取 `getComputedStyle(document.documentElement)` 取得 CSS 變數值，組成 `darkTheme` 物件傳入 chart。`tweaks` store 變動時（accent、upRed）以 `chart.applyOptions()` 動態更新，無須重建圖表。

### D5：成交量子圖

使用 `chart.addHistogramSeries({ priceScaleId: 'volume' })` 建立獨立 y 軸，透過 `priceScale.scaleMargins` 將主 K 線限制在上方 75%、成交量在下方 20%，兩者共享 x 軸時間刻度。

## Risks / Trade-offs

- **SSR 不相容** → `lightweight-charts` 需要 DOM，包在 `onMounted` 內初始化，Vite/CSR 架構無問題
- **ResizeObserver 支援度** → 現代瀏覽器全支援；IE 不在支援範圍，無需 polyfill
- **Mock 資料圖表** → `DashboardPage` 的 Hero 圖目前使用 mock price；若改為 OHLCV 但資料為空，`lightweight-charts` 會渲染空圖。需在 `candles` 為空時顯示 loading skeleton，避免空白閃爍
- **`lightweight-charts` API breaking change** → 固定依賴 v4.x，避免 v5 不相容

## Migration Plan

1. 安裝 `lightweight-charts@4`
2. 新增 `OhlcvPoint` 型別
3. 實作 `TvChart.vue`
4. 更新 `StockDetailPage.vue`：改用 `TvChart`，props 傳入 OHLCV
5. 更新 `DashboardPage.vue`：改用 `TvChart`，確認 hero 圖資料流
6. 寫 `TvChart.spec.ts`，移除 `StockChart.spec.ts` 中已覆蓋的測試
7. 確認兩頁面在 dev server 手動測試通過後，移除 `StockChart.vue`（或保留為 fallback）

**Rollback**：TvChart 為新元件，rollback 只需將 pages import 改回 StockChart，不影響其他模組。

## Open Questions

- `DashboardPage` hero 圖需顯示哪支股票的 K 線？目前是「自選清單第一支」或「固定 2330」？實作時以現有邏輯為準，不改資料流。
