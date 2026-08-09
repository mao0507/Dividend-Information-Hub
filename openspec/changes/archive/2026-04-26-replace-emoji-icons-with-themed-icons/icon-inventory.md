# Emoji / 符號圖示盤點與替換對照

實作採 `frontend/src/components/icons/ThemedIcon.vue`（Heroicons 24/outline 風格、`currentColor`）。

| 區域 | 原符號 / emoji | ThemedIcon `name` |
|------|----------------|-------------------|
| `AlertsPage` 通知列 | ⚡💰📈🧮📉📰🔔 | `bolt` `banknotes` `chart-bar` `calculator` `arrow-trending-down` `newspaper` `bell` |
| `AlertsPage` In-App | ✓ | `check` |
| `CommandPalette` | 🔍 | `magnifying-glass` |
| `CommandPalette` 動作列 | ⚡★$📅 | `bolt` `star` `calculator` `calendar` |
| `CommandPalette` 頁尾 | ↑↓ | `chevron-up` `chevron-down` |
| `DashboardPage` / `KpiCard` | 📅⏳💰 + 第一卡 $ | `calendar` `clock` `banknotes`；第一卡改 `bolt`（今日除息語意） |
| `AppTopbar` | ↓⌁⚙ | `arrow-down-tray` `bell` `cog-6-tooth` |
| `AppSidebar` 主選單 | ◎◫★▲⊞ | `presentation-chart-line` `calendar` `star` `arrow-trending-up` `squares-2x2` |
| `AppSidebar` 工具 | ƒ⌁⚙ | `calculator` `bell` `cog-6-tooth` |
| `RankingPage` 頻率按鈕 | ▾ | `chevron-down` |
| `USelect` 箭頭 | ▾ | `chevron-down` |
| `SettingsPage` 已連結 | ✓ | `check` |
| `StockDetailPage` 按鈕 | ★⚡ | `star` `bolt` |
| `OnboardingPage` | 🎉 | `sparkles` |
| `TweaksPanel` | ⚙ | `cog-6-tooth` |
| `WatchlistPage` 移除 | ✕ | `x-mark` |

未替換（刻意保留）：

- `AppSidebar` 搜尋觸發 `⌘K`、CommandPalette `ESC` / `↵`：鍵盤提示字元，非 emoji 圖示語意。
- `AppSidebar` 底部 YoY `▲`：漲幅符號，與 `text-up` 配色一致，保留文字語意。
