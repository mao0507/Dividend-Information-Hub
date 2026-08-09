## Why

目前有實際案例顯示資料可信度不足：使用者觀察到 `2330` 在 `2026/04/26` 應已超過 2000，但 DB 仍在 1000 左右。這會直接破壞看盤、回測與策略判斷，因此需要建立可重現的價格正確性檢查流程，快速區分「資料抓錯」與「日期／交易日解讀錯誤」。

## What Changes

- 新增後端價格驗證能力：可針對「股票代號 + 日期」輸出 DB 價格、TWSE 官方原始值、比對結果與差異原因。
- 新增交易日守衛：明確標示查詢日期是否為交易日，避免把休市日（如週末）當作應有收盤價的日期。
- 新增差異分類：至少區分「日期不是交易日」「欄位映射錯誤」「資料未同步到最新交易日」「數值解析錯誤」。
- 提供最小可操作介面（受保護 API 或 CLI）讓開發／維運可直接重跑單點驗證（例如 `2330 + 2026-04-26`）。
- 補上文件與測試：確保未來遇到「官方價格與 DB 差很大」時可 5 分鐘內定位問題。

## Capabilities

### New Capabilities
- `stock-price-data-validation`: 針對單一股票與日期，驗證 DB 與 TWSE 原始資料一致性，並回傳可行動的差異診斷。

### Modified Capabilities
- `twse-open-data-sync`: 新增同步後驗證與異常診斷需求（從僅同步資料，提升為可驗證資料品質）。

## Impact

- 後端：`backend/src/data-sync/*`（可能新增 validator service、controller endpoint 或 CLI script）。
- 測試：新增 `data-sync` 測試案例（交易日判斷、欄位比對、異常分類）。
- 文件：`backend/docs/TWSE_DATA_SOURCES.md` 新增「價格異常排查手冊」。
- 操作流程：維運在回報價格異常時，先跑 validator 再判定是否重跑 backfill。
