# tv-chart Specification

## Purpose
以 TradingView lightweight-charts 實作 K 線圖元件（TvChart），支援蠟燭圖、成交量子圖、除息日標記、主題色彩與 RWD 響應，並整合至 StockDetailPage 與 DashboardPage。

## Requirements
### Requirement: TvChart renders candlestick chart from OHLCV data
The `TvChart` component SHALL accept a `candles: OhlcvPoint[]` prop and render a TradingView `lightweight-charts` candlestick series. Each candle SHALL represent one trading day's open/high/low/close values.

#### Scenario: Renders candles when data provided
- **WHEN** `candles` prop contains valid OHLCV data
- **THEN** the chart renders a candlestick series with one candle per data point

#### Scenario: Shows empty state when no data
- **WHEN** `candles` prop is empty or undefined
- **THEN** the chart area displays a loading skeleton and no chart is initialized

### Requirement: TvChart shows volume histogram sub-chart
The `TvChart` component SHALL render a volume histogram below the candlestick chart, sharing the same x-axis time scale. The histogram SHALL occupy the bottom 20% of the chart height while the candlestick occupies the top 75%.

#### Scenario: Volume histogram renders with candles
- **WHEN** `candles` prop contains data with non-zero `volume` values
- **THEN** a histogram appears below the K-line chart using the same time scale

### Requirement: TvChart volume histogram is user-togglable
**MODIFIED** — 原規格要求成交量子圖「始終顯示」，此 change 新增使用者可關閉的需求。

The volume histogram visibility SHALL be controlled by `tweaks.settings.showVolume` (boolean, default `true`). When `false`, the histogram SHALL be hidden and the candlestick price scale SHALL expand to fill the reclaimed space.

#### Scenario: Volume hidden when showVolume is false
- **WHEN** `tweaks.settings.showVolume` is `false`
- **THEN** the volume histogram SHALL NOT be visible
- **AND** the candlestick price scale bottom margin SHALL shrink to give K-line more vertical space

#### Scenario: Volume visible when showVolume is true
- **WHEN** `tweaks.settings.showVolume` is `true`
- **THEN** the volume histogram SHALL be visible below the candlestick series
- **AND** chart margins SHALL match the default layout (bottom 25% reserved for volume)

### Requirement: TvChart marks ex-dividend dates
The `TvChart` component SHALL accept an `exDates?: string[]` prop (ISO date strings). For each date that falls within the visible time range, a vertical marker line SHALL be rendered on the chart.

#### Scenario: Ex-dividend markers appear at correct dates
- **WHEN** `exDates` contains dates within the chart's time range
- **THEN** vertical marker lines appear at those dates on the candlestick chart

### Requirement: TvChart color scheme follows app theme
The `TvChart` component SHALL read design-system CSS variables (`--color-surface`, `--color-border`, `--color-content-faint`, `--color-accent`) on mount and apply them to the chart background, grid, and crosshair. Bullish/bearish candle colors SHALL respect the `upRed` setting from the `tweaks` store.

#### Scenario: Bullish candle color when upRed is false
- **WHEN** `tweaks.upRed` is `false`
- **THEN** bullish (close > open) candles are rendered in green (`#22c55e`)

#### Scenario: Bullish candle color when upRed is true
- **WHEN** `tweaks.upRed` is `true`
- **THEN** bullish candles are rendered in red (`#ef4444`) and bearish candles in green

### Requirement: TvChart crosshair tooltip displays OHLCV values
When the user hovers over the chart, the `lightweight-charts` built-in crosshair SHALL be active. A tooltip overlay SHALL display the hovered candle's date, open, high, low, close, and volume.

#### Scenario: Tooltip appears on hover
- **WHEN** the user moves the pointer over the chart area
- **THEN** the crosshair line and OHLCV tooltip are visible at the hovered position

### Requirement: TvChart is responsive
The `TvChart` component SHALL observe its container's width via `ResizeObserver` and call `chart.applyOptions({ width })` when the container resizes, without destroying and recreating the chart instance.

#### Scenario: Chart resizes with container
- **WHEN** the container element's width changes (e.g., sidebar toggle or window resize)
- **THEN** the chart width updates within one animation frame without a full remount

### Requirement: StockDetailPage uses TvChart with OHLCV data
`StockDetailPage.vue` SHALL replace `StockChart` with `TvChart`, passing the OHLCV data fetched from `GET /stocks/:code/price` and passing `exDates` derived from the stock's dividend records.

#### Scenario: Detail page shows candlestick chart
- **WHEN** the user navigates to a stock detail page
- **THEN** a TradingView-style candlestick chart is displayed with the stock's price history

### Requirement: DashboardPage uses TvChart for hero chart
`DashboardPage.vue` SHALL replace `StockChart` with `TvChart` for the hero chart area, passing OHLCV data for the selected stock.

#### Scenario: Dashboard hero chart shows candlesticks
- **WHEN** the user is on the Dashboard page
- **THEN** the hero chart area displays a candlestick chart for the focused stock
