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
