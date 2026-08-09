## 1. 後端：新增 TAIEX 序列 API

- [x] 1.1 TAIEX 已透過 Method A 儲存於既有 `StockPrice` table（`market='INDEX'`），直接使用現有 `stockApi.getPriceSeries('TAIEX', range)` 端點，無需新增後端路由
- [x] 1.2 後端 `stock-price-sync.service.ts`：`parseTwseMiIndexTaiex()` + `syncDate()` 已完成
- [x] 1.3 `seed.ts` 已加入 TAIEX Stock entry；`market-universe-sync` 已加保護 filter

## 2. 前端：新增 API call

- [x] 2.1 直接使用既有 `stockApi.getPriceSeries('TAIEX', range)`，無需新增 `dashboardApi.getTaiexSeries`
- [x] 2.2 型別已由既有 `OhlcvPoint` 涵蓋，無需新增 `TaiexSeriesResponse`

## 3. 前端：更新 Dashboard.vue

- [x] 3.1 新增 `taiexCandles`、`taiexClosedDates`、`taiexLoading` refs；移除 `heroStock`、`heroPricesLoading`、`heroPriceRequestToken`、`heroDataNotice` refs
- [x] 3.2 新增 `loadTaiexSeries()` async function，呼叫 `stockApi.getPriceSeries('TAIEX', activeRange)` 並更新 `taiexCandles`、`taiexClosedDates`
- [x] 3.3 移除 `loadHeroPrices()`、`extractYearsFromCandles()` functions
- [x] 3.4 將 `watch([heroStock, activeRange], ...)` 改為 `watch(activeRange, () => loadTaiexSeries())`
- [x] 3.5 在 `onMounted` 移除 `stockApi.getFeatured()` 呼叫；改為直接呼叫 `loadTaiexSeries()`
- [x] 3.6 保留 `stockApi` import（仍需 `getPriceSeries`、`getTwseClosedDates`）
- [x] 3.7 更新 template：移除 `v-if="heroStock"` / `v-else` 分支，固定顯示「台灣加權指數」+ `TAIEX`
- [x] 3.8 更新 template：行情列改從 `taiexLatest` computed 取 close / change / changePct，無資料顯示 `--`
- [x] 3.9 將 `<TvChart>` 的 `:candles` 改為 `taiexCandles`、`:loading` 改為 `taiexLoading`
- [x] 3.10 移除 `StockDetail` type import；`OhlcvPoint` 仍需保留（`taiexCandles` 型別）

## 4. 前端：更新 Dashboard.spec.ts

- [x] 4.1 移除 `getFeaturedMock`、`getTwseClosedDatesMock` 及其 `vi.mocked` 呼叫；保留 `getPriceSeriesMock`（改用於 TAIEX）
- [x] 4.2 調整 `beforeEach`：`getPriceSeriesMock` 改回傳 TAIEX 格式，移除 `getFeaturedMock` 設定
- [x] 4.3 更新測試確認 TAIEX 標頭文字與 TvChart 渲染；更新 `expect(getPriceSeriesMock).toHaveBeenCalledWith('TAIEX', ...)` 斷言

## 5. 驗證

- [x] 5.1 執行 `pnpm build`（frontend）確認無 TypeScript 錯誤
- [x] 5.2 執行 `pnpm test`（frontend）確認所有測試通過（88/88）
- [x] 5.3 後端 build 已在先前步驟確認通過
