/**
 * 第一階段股價同步範圍：僅處理資料庫 `Stock` 已存在之代號（與 seed／維護流程對齊）。
 * TWSE `STOCK_DAY_ALL` 為全日行情；本系統過濾為已追蹤標的。
 */
export const TWSE_FIRST_PHASE_SCOPE_NOTE =
  'first-phase: upsert OHLCV only for stock codes present in table Stock (TWSE listed subset in DB)';

/** `MarketSyncState.key`：上市股價日線回填游標 */
export const MARKET_SYNC_KEY_TWSE_STOCK_PRICE_BACKFILL =
  'twse_stock_price_daily_backfill';

/** `MarketSyncState.key`：TWSE 歷史配息回填游標 */
export const MARKET_SYNC_KEY_DIVIDEND_HISTORY_BACKFILL =
  'twse_dividend_history_backfill';
