## Context

目前股價同步流程可把 TWSE 全日行情寫入 `StockPrice`，但缺少「單點驗證」能力。當使用者回報某檔某日價格異常（例如 `2330` 在 `2026-04-26`），團隊需要同時檢查：
1. 該日是否交易日（`2026-04-26` 可能是週末休市）；
2. DB 實際儲值對應到哪個台北交易日；
3. 官方來源該日是否有資料、欄位是否正確映射。

## Goals / Non-Goals

**Goals:**
- 提供可重現、可自動化的「單點價格驗證」流程。
- 回傳結構化結果：`dbValue`、`sourceValue`、`isTradingDay`、`status`、`reason`。
- 驗證流程能直接落在現有 `data-sync` 模組，避免另建平行邏輯。

**Non-Goals:**
- 不重寫整個同步機制。
- 不處理即時盤資料（只處理日線收盤資料）。
- 不在本 change 內導入新的外部付費數據源。

## Decisions

1. **驗證資料來源優先序**
   - 優先使用 TWSE `STOCK_DAY_ALL` 同一交易日資料作比對，與既有同步來源保持一致。
   - 若該日官方回傳空資料，先判斷是否非交易日，再標記 `NO_TRADING_DATA`，不直接判定 DB 錯誤。

2. **日期正規化策略**
   - 所有輸入日期先轉 `Asia/Taipei` 日曆日，再產生 `YYYYMMDD` 查官方、`@db.Date` 查 DB。
   - 驗證結果需明確輸出「標準化後日期」，避免前後端時區落差。

3. **差異分類（固定 enum）**
   - `MATCH`
   - `NOT_TRADING_DAY`
   - `MISSING_IN_DB`
   - `MISSING_IN_SOURCE`
   - `VALUE_MISMATCH`
   - `PARSE_ERROR`

4. **介面型式**
   - 先提供受保護 API（例如 `POST /data-sync/validate/price`），重用現有 `DATA_SYNC_SECRET` 保護。
   - 若需要批量檢查，再擴充 CLI。

## Risks / Trade-offs

- [風險] 官方資料短暫異常或延遲更新 → 緩解：回傳 `sourceFetchAt` 與重試結果，避免誤判。
- [風險] 使用者以休市日比對導致大量誤報 → 緩解：先做交易日判斷並明示 `NOT_TRADING_DAY`。
- [風險] 驗證端點被濫用造成 TWSE 壓力 → 緩解：沿用密鑰保護與節流，必要時加 rate limit。

## Migration Plan

1. 實作 validator service（純函式 + service 包裝）。
2. 加入 API endpoint 與 DTO。
3. 補單元測試（尤其 `2330 + 2026-04-26` 類案例）。
4. 更新排查文件並通知維運流程。

## Open Questions

- 是否要同時驗證 open/high/low/close/volume 全欄位，還是先以 `close` 為主？
- 是否在驗證失敗時提供「一鍵重跑該日 sync」能力（同端點或分開端點）？
