# 任務清單

## Phase 1：基礎建設 + 儀表板

### 1-1 專案初始化

- [ ] **FE-001** 建立 Vite + Vue 3 + TypeScript + Tailwind CSS 前端專案
  - `npm create vite@latest frontend -- --template vue-ts`
  - 安裝：tailwindcss, postcss, autoprefixer
  - 安裝：vue-router@4, pinia, axios, @tanstack/vue-query
  - 設定 `tailwind.config.ts`（A方向設計 token：surface/border/content/accent/danger/warning 色系）
  - 設定 Google Fonts（Inter + Noto Sans TC + JetBrains Mono）
  - 設定 path alias（`@/` → `src/`）

- [ ] **BE-001** 建立 NestJS 後端專案
  - `nest new backend`
  - 安裝：`@prisma/client`, `prisma`
  - 安裝：`@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`, `bcrypt`
  - 安裝：`class-validator`, `class-transformer`
  - 安裝：`@nestjs/config`（.env 管理）
  - 設定 CORS（允許前端 origin）
  - 設定 ValidationPipe（全局）

- [ ] **DB-001** 建立 PostgreSQL + Prisma Schema
  - 建立 PostgreSQL（建議 Supabase 免費方案）
  - 設定 `.env` DATABASE_URL
  - 撰寫完整 `prisma/schema.prisma`（依設計文件 schema）
  - `npx prisma migrate dev --name init`
  - `npx prisma generate`

- [ ] **DB-002** 建立 Seed 資料
  - 撰寫 `prisma/seed.ts`
  - 50 檔主要台股資料（TSMC/0056/00878/00919 等）
  - 每檔 10 年配息歷史
  - 3 個月股價假資料
  - 測試用戶帳號（test@example.com / password123）
  - `npx prisma db seed`

### 1-2 認證系統

- [ ] **BE-002** 實作 Auth Module
  - `POST /auth/register`（email/password + bcrypt hash）
  - `POST /auth/login`（回傳 access + refresh JWT）
  - `POST /auth/refresh`
  - `DELETE /auth/logout`
  - JwtAuthGuard（保護需認證路由）
  - UserSettings 自動建立（on register）

- [ ] **FE-002** 實作認證流程
  - `useAuthStore`（Pinia）
  - axios instance（自動帶 Bearer token、401 自動 refresh）
  - Route guard（未登入導向 /onboarding）

### 1-3 設計系統元件庫

- [ ] **FE-003** 建立原子 UI 元件（`components/ui/`）
  - `UChip.vue` — 顏色徽章（freq 標籤/狀態）
  - `UButton.vue` — Primary / Secondary / Ghost
  - `UToggle.vue` — 開關按鈕
  - `UBadge.vue` — 數字 badge（側欄用）
  - `USlider.vue` — 滑桿（DRIP 試算用）
  - `USelect.vue` — 下拉選單

- [ ] **FE-004** 建立佈局元件（`components/layout/`）
  - `AppSidebar.vue` — 220px 側欄（Logo/搜尋/NavItems/底部累計）
  - `AppTopbar.vue` — 頂欄（麵包屑/即時指標/動作按鈕）
  - `AppLayout.vue` — Sidebar + Topbar + Content slot
  - `TweaksPanel.vue` — 右下角 Tweaks 面板（accent/密度/字型）
  - `useTweaksStore`（Pinia，即時更新 CSS variables）

- [ ] **FE-005** 建立圖表元件（`components/chart/`）
  - `StockChart.vue` — SVG 走勢圖（含除息缺口標記/crosshair/grid）
  - `SparkLine.vue` — 迷你折線圖（自選股列表用）
  - `VolumeBar.vue` — 成交量柱（個股詳情用）

### 1-4 Dashboard 頁面

- [ ] **BE-003** Dashboard API
  - `GET /dashboard/summary`（今日除息N檔/代號/本週除息/待填息/下次發放+預估金額）
  - `GET /stocks/featured` — Hero 個股資料（自選股第一筆）
  - `GET /calendar/upcoming?days=7` — 未來7日除息

- [ ] **FE-006** Dashboard 頁面（`pages/DashboardPage.vue`）
  - KPI 橫列 4 格（今日除息/本週除息/待填息/下次發放）
  - Hero 個股卡片（名稱+代號+股價+漲跌+時間區間切換+StockChart）
  - 右側自選股列表（代號/名稱/Spark/股價/配息/除息日/填息率）
  - 右側未來7日除息（日期/星期/N檔/自選高亮/預估金額）
  - 側欄底部累計領息 + YoY%

---

## Phase 2：除息行事曆 + 個股詳情

### 2-1 除息行事曆

- [ ] **BE-004** Calendar API
  - `GET /calendar?year=2026&month=4`
  - 回傳：每日事件陣列（stockCode/name/amount/type/isWatchlist/isToday）
  - 支援篩選 query：`?watchlistOnly=true&freq=月配&yieldGt=5`

- [ ] **FE-007** 除息行事曆頁面（`pages/CalendarPage.vue`）
  - 月曆格子（7列，前後月份半透明 padding）
  - 今日：綠色邊框 + TODAY label
  - 事件晶片：除息（綠左邊）/ 發放（琥珀左邊）/ 自選（藍左邊）/ 超3筆顯示 +N 更多
  - 日/週/月/年 視圖切換（MVP 實作月視圖，其餘 placeholder）
  - 上下月導覽 + 今天按鈕
  - 側欄：圖例 + 篩選（僅自選/含ETF/頻率/殖利率門檻）
  - 底部狀態列（本月N檔/自選N檔/發放N筆/預計金額/最密集日）
  - Mobile：壓縮方格 + 日點 + 點擊日期展開清單

### 2-2 個股詳情

- [ ] **BE-005** Stock Detail API
  - `GET /stocks/:code` — 基本資料
  - `GET /stocks/:code/dividends` — 配息歷史（10年）含填息天數
  - `GET /stocks/:code/price?range=6M` — 股價走勢（OHLCV）
  - `GET /stocks/:code/peers` — 同業比較（同 sector 前6筆，依殖利率排序）
  - `GET /stocks/:code/fill-progress` — 本次填息進度（%/天數/剩餘）

- [ ] **FE-008** 個股詳情頁面（`pages/StockDetailPage.vue`，高度 auto 可捲動）
  - 頂欄：麵包屑 + ★自選按鈕 + ⚡提醒按鈕
  - Header：Logo色塊 + 名稱/代號/交易所/產業/指數 + 頻率晶片 + 連N年晶片 + 今日除息晶片
  - 股價大字 + 漲跌 + 時間 + 成交量
  - KPI 6格：本次配息/殖利率/除息日/發放日/平均填息/配息穩定度
  - 走勢圖卡片：K線/折線/區域切換 + 時間區間 + 疊加比較 + 成交量柱
  - 配息歷史10年：柱狀圖（現金股利高度 + 殖利率% + 填息天數badge）
  - 填息進度：SVG Timeline（除息點/目標線/填息曲線/進度%）
  - 同業比較表：代號/名稱/股價/殖利率/市值（6筆，本股高亮）
  - 持有分析：持有成本/現值/價差報酬/累積配息/遞延總報酬（5格）
  - Mobile：壓縮版（StockChart 小圖 + 2×3 KPI格 + 迷你配息史 + 底部 CTA）

---

## Phase 3：自選股管理 + 高股息排行

### 3-1 高股息排行 / 篩選器

- [ ] **BE-006** Ranking API
  - `GET /stocks/ranking`
  - query params：`yieldGt`, `freq`, `sector`, `streakGte`, `fillDaysLte`, `marketCapGte`, `page`, `limit`
  - 回傳：rank/code/name/freq/yield/cash/price/chg/fillRate/badge
  - `GET /stocks/ranking/presets` — 預設篩選組合

- [ ] **FE-009** 高股息排行頁面（`pages/RankingPage.vue`）
  - 篩選列（pill 形式：殖利率/頻率/產業/連續配息/填息天數/市值）▾ 下拉
  - 側欄：預設篩選組合（可點選套用）
  - 表格：# / 代號 / 名稱（產業badge+特殊badge） / 頻率 / 殖利率↓ / 配息 / 股價 / 漲跌 / 填息進度條 / ★⚡
  - 匯出 CSV 按鈕
  - 篩選結果 N 檔計數
  - Mobile：卡片列表（rank/名稱/殖利率/漲跌） + 水平捲動篩選晶片

### 3-2 自選股管理

- [ ] **BE-007** Watchlist API
  - `GET /watchlist` — 自選股分組
  - `POST /watchlist/groups` — 新增分組
  - `PATCH /watchlist/groups/:id` — 修改（名稱/顏色）
  - `DELETE /watchlist/groups/:id`（需先移動股票）
  - `POST /watchlist/items` — 加入自選（groupId + stockCode）
  - `DELETE /watchlist/items/:id`
  - `PATCH /watchlist/items/reorder` — 拖曳排序（ids 陣列）
  - `GET /watchlist/summary` — 總市值/今年領息/待除息/自選股總數

- [ ] **FE-010** 自選股管理頁面（`pages/WatchlistPage.vue`）
  - 摘要 4格（自選股總數/總市值/今年領息/待除息）
  - 側欄：分組清單（顏色點/名稱/數量）+ 新增分組
  - 分組卡片（可展開）：⋮⋮拖曳 / 名稱+代號+產業 / Spark / 股價+漲跌 / 下次除息 / 配息額 / 填息晶片 / ⚡⋮
  - 搜尋框（⌘K）+ 新增按鈕
  - 拖曳排序（vue-draggable-plus）

---

## Phase 4：試算 + 視覺化 + 提醒中心

### 4-1 再投入試算（DRIP）

- [ ] **BE-008** DRIP 計算 API
  - `POST /drip/calculate`
  - Body：`{ principal, monthlyAdd, yield, growth, years, taxRate }`
  - 回傳：每年資產值（含/不含再投入）/達成目標年份/第N年年息/月均
  - 純計算，無需認證

- [ ] **FE-011** DRIP 試算頁面（`pages/DripPage.vue`）
  - 輸入面板（6個 USlider）：初始投入/每月加碼/殖利率/成長率/期間/稅率
  - 目標區：年領目標 + 月均 + 預計第N年達成（高亮提示）
  - 時間範圍切換：5Y/10Y/20Y/30Y
  - SVG 面積圖：再投入線（綠）vs 領出線（虛線灰）+ 里程碑標記
  - 年度 X 軸（Y0~YN）
  - 結果摘要：10年後資產/第10年年息/月均/通膨調整後報酬率

### 4-2 視覺化分析

- [ ] **BE-009** Viz API
  - `GET /viz/sector-distribution` — 持倉產業分布（按市值%）
  - `GET /viz/monthly-income?year=2026` — 月度股息收入（12個月預估）
  - `GET /viz/heatmap?year=2026` — 產業×月份熱力圖
  - `GET /viz/annual-growth?years=6` — 年度累計分層成長

- [ ] **FE-012** 視覺化分析頁面（`pages/VizPage.vue`）
  - 年份切換（2024/2025/2026）
  - Row1：甜甜圈圖（產業分布+SVG） + 月度柱狀圖（當月綠/峰值琥珀）
  - Row2：產業×月份熱力圖（4×12格，透明度代表強度）
  - Row3：6年分層柱狀圖（半導體/金融/ETF/其他疊加）
  - `DonutChart.vue`, `BarChart.vue`, `HeatmapGrid.vue`, `StackedBar.vue`

### 4-3 提醒中心

- [ ] **BE-010** Alert API
  - `GET /alerts/notifications?type=&page=` — 通知動態（分頁）
  - `PATCH /alerts/notifications/read-all`
  - `PATCH /alerts/notifications/:id/read`
  - `GET /alerts/rules`
  - `POST /alerts/rules` — 新增規則
  - `PATCH /alerts/rules/:id` — 修改/toggle isOn
  - `DELETE /alerts/rules/:id`

- [ ] **FE-013** 提醒中心頁面（`pages/AlertsPage.vue`）
  - 左欄：篩選 tabs（全部/除息/發放/新聞/未讀）+ 通知卡片列表
    - 卡片：type icon / 標題+代號badge+未讀綠點 / 內容 / 時間戳
  - 右欄 380px：規則列表（toggle/標題/對象/管道/觸發次數） + 新增規則 + 通知管道狀態
  - Mobile：全寬通知列表 + 未讀 badge

---

## Phase 5：Onboarding + 設定 + ⌘K + 收尾

### 5-1 Onboarding 嚮導

- [ ] **FE-014** Onboarding 頁面（`pages/OnboardingPage.vue`）
  - 左半：品牌視覺（漸層背景/Headline/3個stat卡片/copyright）
  - 右半：4步驟 stepper
    - Step 1：帳號建立（email/password + 驗證）
    - Step 2：加入自選股（搜尋框 + 熱門推薦晶片 + 已選N檔）
    - Step 3：設定提醒偏好（選擇管道/規則）
    - Step 4：完成（進入 Dashboard）
  - 略過按鈕（跳到 Dashboard）

### 5-2 設定

- [ ] **BE-011** Settings API
  - `GET /settings`
  - `PATCH /settings`（accent/upRed/density/monoFont/sansFont/radius）
  - `GET /settings/brokers`
  - `POST /settings/brokers/link`（MVP：只儲存連結記錄）
  - `DELETE /settings/brokers/:id`
  - `PATCH /settings/sync`（同步偏好 toggle）

- [ ] **FE-015** 設定頁面（`pages/SettingsPage.vue`）
  - 二級導覽：帳號/個人資料/通知/證券戶連結/訂閱/資料匯出/外觀/安全/關於
  - 「證券戶連結」子頁（預設展示）：
    - 4家券商卡片（已連結✓ / 未連結連結按鈕）
    - 資料安全說明（唯讀/OAuth/2FA）
    - 同步偏好 5項 toggle
  - 「外觀」子頁：對應 Tweaks 設定（持久化到後端）

### 5-3 ⌘K 全域搜尋

- [ ] **BE-012** Search API
  - `GET /stocks?q=台積&limit=10`（全文搜尋 name + nameAlias + code）

- [ ] **FE-016** Command Palette（`components/layout/CommandPalette.vue`）
  - 全域快捷鍵監聽（⌘K / Ctrl+K）
  - 背景：主畫面模糊 + 半透明 overlay
  - 搜尋框（debounce 300ms）+ ESC 關閉
  - 結果分組：股票（代號/名稱/產業+頻率/股價） / 動作（⚡/★/$/$📅） / 最近瀏覽
  - 鍵盤導覽：↑↓選擇 / ↵開啟 / ⌘↵新分頁
  - 動作快捷鍵提示（⌘A設提醒/⌘S加自選/⌘D試算）

### 5-4 測試 + 收尾

- [ ] **TEST-001** 後端單元測試（核心模組）
  - Auth service（register/login/refresh）
  - DRIP calculator（純函數，易測）
  - Watchlist service（CRUD + reorder）
  - Alert rule matching 邏輯

- [ ] **TEST-002** 前端元件測試（Vitest + @vue/test-utils）
  - UChip, UButton, UToggle
  - StockChart props
  - useAuthStore actions

- [ ] **TEST-003** E2E 測試（Playwright）
  - 登入 → Dashboard 流程
  - 加入自選股 → 出現在 Watchlist
  - ⌘K 搜尋 → 導向個股詳情

- [ ] **INFRA-001** 部署設定
  - Frontend：Vercel（`vercel.json` 設定 SPA redirect）
  - Backend：Railway 或 Render（Dockerfile 或 buildpack）
  - 環境變數設定（DB_URL / JWT_SECRET / CORS_ORIGIN）
  - `README.md` 本地開發啟動文件

---

## 任務統計

| Phase | 任務數 | 預估工時 |
|-------|--------|---------|
| Phase 1：基礎 + 儀表板 | 9 | ~3天 |
| Phase 2：行事曆 + 個股詳情 | 4 | ~3天 |
| Phase 3：自選 + 排行 | 4 | ~2天 |
| Phase 4：試算 + 視覺化 + 提醒 | 6 | ~3天 |
| Phase 5：Onboarding + 設定 + ⌘K + 測試 | 7 | ~3天 |
| **合計** | **30** | **~14天** |
