## ADDED Requirements

### Requirement: 後端提供 TAIEX 每日歷史序列 API
系統 SHALL 在 `GET /dashboard/taiex-series?range=<range>` 端點回傳加權指數的每日 OHLCV 資料，`range` 接受與個股相同的時間範圍參數（`1W`、`1M`、`3M`、`6M`、`1Y`、`MAX`），預設 `6M`。

#### Scenario: 正常取得指定範圍資料
- **WHEN** 前端以有效 `range`（例如 `6M`）呼叫 `/dashboard/taiex-series`
- **THEN** 後端 SHALL 回傳 `{ data: OhlcvPoint[], latest: { close, change, changePct } }`，其中 `data` 為依日期升冪排列的每日 K 線陣列
- **AND** `latest` 中的 `close`、`change`、`changePct` SHALL 反映最後一個交易日的加權指數收盤數值

#### Scenario: TWSE 上游不可用
- **WHEN** 呼叫 TWSE MI_5MINS_HIST 失敗（網路錯誤、格式異常）
- **THEN** 後端 SHALL 回傳 `{ data: [], latest: null }`，不得拋出 500 錯誤

#### Scenario: 快取命中
- **WHEN** 同一月份的 TWSE 資料已在後端記憶體快取中（TTL 60 分鐘）
- **THEN** 後端 SHALL 直接回傳快取資料，不得再次呼叫 TWSE

### Requirement: 儀表板主圖永遠顯示加權指數
儀表板圖表區 SHALL 永遠以 TAIEX 加權指數資料驅動 `TvChart`，不得再根據使用者自選股動態切換為個別股票。

#### Scenario: 頁面掛載
- **WHEN** Dashboard 頁面掛載（`onMounted`）
- **THEN** 系統 SHALL 呼叫 `dashboardApi.getTaiexSeries(activeRange)` 並將結果傳入 `TvChart`
- **AND** 圖表標頭 SHALL 固定顯示「台灣加權指數」與代號「TAIEX」，不得顯示任何個股名稱或代號

#### Scenario: 切換時間範圍
- **WHEN** 使用者點選範圍按鈕（1W / 1M / 3M / 6M / 1Y / MAX）
- **THEN** 系統 SHALL 重新呼叫 `getTaiexSeries(newRange)` 並更新圖表

### Requirement: 標頭行情顯示真實 TAIEX 最新收盤數值
圖表區標頭的收盤點位、漲跌點數與漲跌幅 SHALL 來自後端 `taiex-series` API 的 `latest` 欄位，不得使用硬編碼數值。

#### Scenario: 資料正常回傳
- **WHEN** `taiex-series` API 回傳含有效 `latest` 的回應
- **THEN** 前端 SHALL 以 `latest.close` 顯示收盤點位，以 `latest.change` 顯示漲跌點數，以 `latest.changePct` 顯示漲跌幅百分比

#### Scenario: 資料載入中或失敗
- **WHEN** API 呼叫尚未完成，或 `latest` 為 null
- **THEN** 前端 SHALL 以 `--` 或 `—` 作為佔位符，不得顯示 0 或硬編碼數值
