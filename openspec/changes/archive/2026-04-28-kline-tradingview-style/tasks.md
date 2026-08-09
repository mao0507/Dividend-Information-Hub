## 1. 安裝套件與型別

- [x] 1.1 在 `frontend/` 安裝 `lightweight-charts@4`
- [x] 1.2 在 `frontend/src/types/index.ts` 新增 `OhlcvPoint` 介面（`date: string`, `open`, `high`, `low`, `close`, `volume: number`）

## 2. TvChart 元件

- [x] 2.1 建立 `frontend/src/components/chart/TvChart.vue`：`candles: OhlcvPoint[]`、`exDates?: string[]`、`height?: number` props；在 `onMounted` 以 `createChart()` 初始化 `lightweight-charts`
- [x] 2.2 加入 K 線燭台 series（`addCandlestickSeries`），以 `setData(candles)` 寫入資料，上漲/下跌顏色跟隨 `tweaks.upRed`
- [x] 2.3 加入成交量子圖（`addHistogramSeries({ priceScaleId: 'volume' })`），設定 `scaleMargins` 讓主圖佔 75%、量圖佔 20%
- [x] 2.4 讀取 CSS 變數（`--color-surface`、`--color-border`、`--color-content-faint`）組成深色主題並以 `chart.applyOptions()` 套用
- [x] 2.5 於 `exDates` 每個日期以 `addHistogramSeries` marker 或 `setMarkers()` 在燭台圖加入除息標記
- [x] 2.6 實作 `ResizeObserver`：監聽 container 寬度，resize 時呼叫 `chart.applyOptions({ width })`
- [x] 2.7 在 `onUnmounted` 呼叫 `chart.remove()` 清除實例
- [x] 2.8 `candles` 為空時顯示 loading skeleton，不初始化 chart 避免空白閃爍

## 3. 頁面整合

- [x] 3.1 `StockDetailPage.vue`：import `TvChart` 取代 `StockChart`；將 API 回傳的 price 陣列轉型為 `OhlcvPoint[]`；從 dividends 提取 `exDate` 字串陣列傳入 `exDates` prop
- [x] 3.2 `DashboardPage.vue`：import `TvChart` 取代 `StockChart`；確認 hero 圖的 OHLCV 資料流（`heroCandles` computed）；移除舊有 `heroSeriesForChart`（只有 close 的陣列）

## 4. 測試

- [x] 4.1 建立 `frontend/src/components/chart/TvChart.spec.ts`：mock `lightweight-charts` 模組，驗證 `createChart` 被呼叫、`candles` 為空時不呼叫 `setData`
- [x] 4.2 驗證 `tweaks.upRed=true` 時 `addCandlestickSeries` 接收紅漲/綠跌顏色參數
- [x] 4.3 驗證 ResizeObserver callback 觸發時呼叫 `chart.applyOptions` 更新寬度
