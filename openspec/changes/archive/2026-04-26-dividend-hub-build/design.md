# 系統架構設計

## 整體架構

```
┌──────────────────────────────────────────────────────────────┐
│  Browser                                                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Vue 3 + TypeScript + Tailwind CSS + Vite            │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐             │   │
│  │  │ pages/   │ │components│ │composables│             │   │
│  │  │ (Router) │ │  /ui     │ │(業務邏輯) │             │   │
│  │  └──────────┘ └──────────┘ └──────────┘             │   │
│  │  ┌──────────────────────────────────────┐            │   │
│  │  │  Pinia (state) + @tanstack/vue-query  │            │   │
│  │  └──────────────────────────────────────┘            │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────┬────────────────────────────────────┘
                          │ REST API / (未來 WebSocket)
┌─────────────────────────▼────────────────────────────────────┐
│  NestJS + TypeScript                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │  Auth    │ │  Stock   │ │Watchlist │ │  Alert   │       │
│  │  Module  │ │  Module  │ │  Module  │ │  Module  │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ Calendar │ │Portfolio │ │   DRIP   │ │  Viz     │       │
│  │  Module  │ │  Module  │ │  Module  │ │  Module  │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│  ┌─────────────────────────────────────────────────┐        │
│  │  Prisma ORM                                     │        │
│  └─────────────────────────────────────────────────┘        │
└─────────────────────────┬────────────────────────────────────┘
                          │
┌─────────────────────────▼──────────┐
│  PostgreSQL                        │
└────────────────────────────────────┘
```

## 前端目錄結構

```
frontend/
├── src/
│   ├── assets/          # 靜態資源
│   ├── components/
│   │   ├── ui/          # 原子元件（Button, Chip, Toggle...）
│   │   ├── chart/       # 圖表元件（StockChart, Spark, DonutChart...）
│   │   └── layout/      # 佈局（Sidebar, Topbar, CommandPalette）
│   ├── composables/     # Vue composables（useStock, useWatchlist...）
│   ├── pages/           # 頁面元件（路由對應）
│   ├── stores/          # Pinia stores（auth, tweaks, watchlist）
│   ├── api/             # API 呼叫封裝（axios instances）
│   ├── types/           # 共用 TypeScript 型別
│   └── router/          # Vue Router 設定
├── tailwind.config.ts   # 含 A 方向設計 token
└── vite.config.ts
```

## 後端目錄結構

```
backend/
├── src/
│   ├── auth/            # JWT 認證、登入、註冊
│   ├── stock/           # 股票資料 CRUD、搜尋
│   ├── dividend/        # 配息記錄、歷史、除息行事曆
│   ├── watchlist/       # 自選股、分組管理
│   ├── portfolio/       # 持倉分析、成本計算
│   ├── alert/           # 提醒規則、通知歷史
│   ├── drip/            # DRIP 試算（純計算，無需 DB）
│   ├── viz/             # 視覺化彙總資料
│   ├── prisma/          # Prisma service
│   └── common/          # Guards、Interceptors、Pipes
├── prisma/
│   ├── schema.prisma
│   └── seed.ts          # 台股 seed data（MVP 階段）
└── test/
```

## 資料庫 Schema

```prisma
// prisma/schema.prisma

model User {
  id          String   @id @default(cuid())
  email       String   @unique
  name        String?
  passwordHash String
  createdAt   DateTime @default(now())

  watchlistGroups WatchlistGroup[]
  holdings        Holding[]
  alertRules      AlertRule[]
  notifications   Notification[]
  settings        UserSettings?
}

model UserSettings {
  id        String  @id @default(cuid())
  userId    String  @unique
  accent    String  @default("#22c55e")
  upRed     Boolean @default(true)      // 台股慣例
  density   String  @default("cozy")
  monoFont  String  @default("JetBrains Mono")
  sansFont  String  @default("Inter")
  radius    Int     @default(10)

  user      User    @relation(fields: [userId], references: [id])
}

model Stock {
  code       String   @id              // "2330"
  name       String                    // "台積電"
  nameAlias  String?                   // 用於搜尋的別名
  sector     String                    // "半導體"
  market     String   @default("TWSE") // TWSE | OTC
  isEtf      Boolean  @default(false)
  pe         Float?
  marketCap  BigInt?
  updatedAt  DateTime @updatedAt

  dividends   Dividend[]
  prices      StockPrice[]
  watchlistItems WatchlistItem[]
  holdings    Holding[]
}

model Dividend {
  id          String   @id @default(cuid())
  stockCode   String
  year        Int
  period      Int      @default(1)  // 季配：1~4，年配：1，月配：1~12
  freq        String                // 月 | 季 | 年
  cash        Float                 // 現金股利
  stockDiv    Float    @default(0)  // 股票股利
  exDate      DateTime?             // 除息日
  payDate     DateTime?             // 發放日
  announcedAt DateTime?
  fillDays    Int?                  // 歷史填息天數（已完成才有）
  filled      Boolean  @default(false)

  stock       Stock    @relation(fields: [stockCode], references: [code])
  @@unique([stockCode, year, period])
}

model StockPrice {
  id        String   @id @default(cuid())
  stockCode String
  date      DateTime @db.Date
  open      Float
  high      Float
  low       Float
  close     Float
  volume    BigInt

  stock     Stock    @relation(fields: [stockCode], references: [code])
  @@unique([stockCode, date])
}

model WatchlistGroup {
  id      String   @id @default(cuid())
  userId  String
  name    String                    // "核心" | "高股息ETF" | "觀察中"
  color   String   @default("#22c55e")
  order   Int      @default(0)

  user    User     @relation(fields: [userId], references: [id])
  items   WatchlistItem[]
}

model WatchlistItem {
  id        String   @id @default(cuid())
  groupId   String
  stockCode String
  order     Int      @default(0)
  addedAt   DateTime @default(now())

  group     WatchlistGroup @relation(fields: [groupId], references: [id])
  stock     Stock          @relation(fields: [stockCode], references: [code])
  @@unique([groupId, stockCode])
}

model Holding {
  id         String   @id @default(cuid())
  userId     String
  stockCode  String
  shares     Int
  avgCost    Float
  boughtAt   DateTime @default(now())

  user       User     @relation(fields: [userId], references: [id])
  stock      Stock    @relation(fields: [stockCode], references: [code])
}

model AlertRule {
  id        String   @id @default(cuid())
  userId    String
  label     String
  type      String   // exDiv | payment | fill | yield | drop | announce
  isOn      Boolean  @default(true)
  matchType String   @default("watchlist") // watchlist | all | specific
  stockCode String?  // 若 matchType = specific
  channels  String[] // ["email", "push", "line"]
  threshold Float?   // 用於 yield / fill 類型

  user          User           @relation(fields: [userId], references: [id])
  notifications Notification[]
}

model Notification {
  id          String   @id @default(cuid())
  userId      String
  alertRuleId String?
  type        String   // exDiv | payment | fill | news | yield | drop
  stockCode   String?
  title       String
  body        String
  isRead      Boolean  @default(false)
  createdAt   DateTime @default(now())

  user        User      @relation(fields: [userId], references: [id])
  alertRule   AlertRule? @relation(fields: [alertRuleId], references: [id])
}
```

## API 端點規劃

```
Auth
  POST   /auth/register
  POST   /auth/login
  POST   /auth/refresh
  DELETE /auth/logout

Stock
  GET    /stocks?q=台積&limit=10          搜尋（⌘K用）
  GET    /stocks/:code                    個股基本資料
  GET    /stocks/:code/dividends          配息歷史
  GET    /stocks/:code/price?range=6M     股價走勢
  GET    /stocks/:code/peers              同業比較
  GET    /stocks/ranking?yield_gt=3&freq=季配&limit=50  排行篩選

Calendar
  GET    /calendar?year=2026&month=4      月份除息事件
  GET    /calendar/upcoming?days=7        未來N日除息

Watchlist
  GET    /watchlist                       我的自選股（含分組）
  POST   /watchlist/groups               新增分組
  PATCH  /watchlist/groups/:id           修改分組
  DELETE /watchlist/groups/:id
  POST   /watchlist/items                加入自選股
  DELETE /watchlist/items/:id
  PATCH  /watchlist/items/reorder        拖曳排序

Portfolio
  GET    /portfolio                       持倉分析
  POST   /portfolio/holdings             新增持倉
  PATCH  /portfolio/holdings/:id
  DELETE /portfolio/holdings/:id

Alert
  GET    /alerts/notifications           通知動態（分頁）
  PATCH  /alerts/notifications/read-all  全部標已讀
  GET    /alerts/rules                   規則列表
  POST   /alerts/rules                   新增規則
  PATCH  /alerts/rules/:id               修改/toggle
  DELETE /alerts/rules/:id

Dashboard
  GET    /dashboard/summary              今日KPI（除息檔數/待填息/下次發放）

Viz
  GET    /viz/sector-distribution        產業分布
  GET    /viz/monthly-income?year=2026   月度股息收入
  GET    /viz/heatmap?year=2026          熱力圖資料
  GET    /viz/annual-growth             年度累計成長

Settings
  GET    /settings                       用戶設定
  PATCH  /settings                       更新設定
  POST   /settings/brokers/link          券商連結（MVP: 僅存記錄，不真實串接）

DRIP（無需認證，純計算）
  POST   /drip/calculate                 { principal, monthlyAdd, yield, growth, years, taxRate }
```

## 前端路由

```
/                          重導向到 /dashboard
/onboarding                Onboarding 嚮導（未登入才顯示）
/dashboard                 儀表板
/calendar                  除息行事曆
/stock/:code               個股詳情
/ranking                   高股息排行
/watchlist                 自選股管理
/drip                      再投入試算
/alerts                    提醒中心
/viz                       視覺化分析
/settings                  設定
```

## 設計 Token（Tailwind 自訂）

```typescript
// tailwind.config.ts 自訂 A 方向 token
colors: {
  surface: {
    DEFAULT: '#0a0a0b',  // bg
    2: '#101013',         // bg2
    3: '#16161a',         // bg3
  },
  border: {
    DEFAULT: 'rgba(255,255,255,0.06)',
    strong: 'rgba(255,255,255,0.14)',
  },
  content: {
    DEFAULT: '#e8e8ea',
    soft: 'rgba(255,255,255,0.6)',
    faint: 'rgba(255,255,255,0.38)',
  },
  accent: { DEFAULT: '#22c55e' },
  danger: { DEFAULT: '#ef4444' },
  warning: { DEFAULT: '#f59e0b' },
}
fontFamily: {
  sans: ["'Inter'", "'Noto Sans TC'", 'system-ui'],
  mono: ["'JetBrains Mono'", 'monospace'],
}
```

## 狀態管理（Pinia）

```
useAuthStore     — 用戶資訊、JWT token、登入/登出
useTweaksStore   — accent/density/font 等 UI 設定
useWatchlistStore — 自選股快取（sidebar 徽章數）
useSearchStore   — ⌘K 搜尋結果快取
```

## 認證策略

- JWT + HttpOnly Cookie（access token 15分鐘 + refresh token 7天）
- NestJS Guards 保護所有需認證的端點
- DRIP 計算端點無需認證

## 資料同步策略（MVP）

- 台股資料：Prisma seed.ts 預置 50 檔主要股票 + 10年配息歷史
- 股價走勢：seed 假資料（Phase 2 再串真實 API）
- 除息事件：從 Dividend 表計算生成 Calendar
