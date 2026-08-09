## 1. 安裝與基礎設定

- [x] 1.1 安裝 `primevue@^4` 套件
- [x] 1.2 建立 `frontend/src/primevue-pt.ts`：定義 Button、Select、Badge、ToggleSwitch、Chip、Slider 的 global PT 設定（從現有 U* 元件與 form-control-styles.ts 抄錄並轉換）
- [x] 1.3 更新 `main.ts`：引入 PrimeVue，`app.use(PrimeVue, { unstyled: true, pt: primevuePT })`

## 2. Layout 元件替換

- [x] 2.1 `AppSidebar.vue`：UBadge → Badge，更新 import

## 3. 功能元件替換

- [x] 3.1 `TweaksPanel.vue`：USlider → 展開 label/value markup + Slider，更新 import
- [x] 3.2 `LoginPage.vue`：UButton → Button，更新 import 與所有 variant/size prop
- [x] 3.3 `OnboardingPage.vue`：UButton → Button，更新 import 與所有 variant/size prop
- [x] 3.4 `CalendarPage.vue`：UToggle → ToggleSwitch，UChip → Chip with :pt，更新 import
- [x] 3.5 `DashboardPage.vue`：UChip → Chip with :pt，更新 import
- [x] 3.6 `DripPage.vue`：USlider (x6) → 展開 markup + Slider，UChip → Chip with :pt，更新 import
- [x] 3.7 `RankingPage.vue`：UButton → Button，USelect → Select，UChip → Chip with :pt，更新 import
- [x] 3.8 `AlertsPage.vue`：USelect → Select，更新 import
- [x] 3.9 `SettingsPage.vue`：USelect → Select，更新 import，inline themedCheckboxClass
- [x] 3.10 `StockDetailPage.vue`：UChip → Chip with :pt，更新 import
- [x] 3.11 `WatchlistPage.vue`：UButton → Button，USelect → Select，UChip → Chip with :pt，更新 import

## 4. 清理

- [x] 4.1 刪除 `frontend/src/components/ui/` 下全部 6 個 U* 元件檔案（含 spec）
- [x] 4.2 刪除 `frontend/src/constants/form-control-styles.ts`（含 spec）

## 5. 測試修正

- [x] 5.1 更新受影響的 spec 檔案：移除或更新對 U* 元件的 vi.mock，確認 DOM selector 正確
- [x] 5.2 執行 `pnpm test` 確認全部測試通過，無回歸（88/88 passed）
