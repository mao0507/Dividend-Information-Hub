## ADDED Requirements

### Requirement: TAIEX price fallback returns today's close
When `StockPrice` has no data for TAIEX and a fallback is attempted, the system SHALL return today's closing value from TWSE MI_INDEX using `parseTwseMiIndexTaiex`, instead of returning an empty array.

#### Scenario: Fallback succeeds for TAIEX
- **WHEN** `getPriceSeries('TAIEX', range)` is called and DB has no StockPrice rows for TAIEX
- **THEN** the response SHALL contain exactly one candle with today's close value (open = high = low = close)

#### Scenario: Fallback returns empty when TWSE unavailable
- **WHEN** `getPriceSeries('TAIEX', range)` is called, DB has no rows, and TWSE MI_INDEX request fails
- **THEN** the response SHALL return an empty data array with `fallbackFailed: true` in diagnostics

### Requirement: TAIEX data status diagnostic endpoint
The system SHALL expose `GET /admin/data-sync/taiex-status` returning current TAIEX price data presence in the database.

#### Scenario: Query with existing data
- **WHEN** `GET /admin/data-sync/taiex-status` is called and StockPrice has TAIEX rows
- **THEN** response SHALL include `count`, `earliest` (ISO date string), and `latest` (ISO date string)

#### Scenario: Query with no data
- **WHEN** `GET /admin/data-sync/taiex-status` is called and StockPrice has no TAIEX rows
- **THEN** response SHALL include `count: 0` with `earliest: null` and `latest: null`

### Requirement: TAIEX historical backfill endpoint
The system SHALL expose `POST /admin/data-sync/taiex-backfill` accepting `from` and `to` query parameters (YYYY-MM-DD) to trigger historical TAIEX price backfill.

#### Scenario: Successful backfill for date range
- **WHEN** `POST /admin/data-sync/taiex-backfill?from=2024-01-01&to=2024-03-31` is called
- **THEN** system SHALL call `syncDate` for each calendar day in range, upsert TAIEX StockPrice rows, and return `{ upserted: <n>, skipped: <n> }`

#### Scenario: Range exceeds 730-day limit
- **WHEN** `POST /admin/data-sync/taiex-backfill` is called with a range exceeding 730 days
- **THEN** system SHALL return HTTP 400 with message `"Date range must not exceed 730 days"`

#### Scenario: Invalid date format
- **WHEN** `POST /admin/data-sync/taiex-backfill?from=invalid&to=2024-01-01` is called
- **THEN** system SHALL return HTTP 400 with message `"Invalid date format"`

#### Scenario: Non-trading day skipped gracefully
- **WHEN** `syncDate` is called for a weekend or holiday and TWSE returns empty data
- **THEN** system SHALL count that day as `skipped` and continue to the next day without error
