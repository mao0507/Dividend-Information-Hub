export interface Stock {
  code: string
  name: string
  sector: string
  market: string
  isEtf: boolean
  pe?: number
  marketCap?: number
}

export interface Dividend {
  id: string
  stockCode: string
  year: number
  period: number
  freq: 'monthly' | 'quarterly' | 'annual'
  cash: number
  stockDiv: number
  exDate?: string
  payDate?: string
  fillDays?: number
  filled: boolean
}

export interface StockDetail extends Stock {
  price: number
  change: number
  changePct: number
  volume: number
  high52w?: number
  low52w?: number
  updatedAt: string | null
  latestDividend?: Dividend
  streak: number
  annualCash?: number
  yieldPct?: number
  avgFillDays?: number
  stabilityScore?: number
}

export interface WatchlistGroup {
  id: string
  name: string
  color: string
  order: number
  items: WatchlistItem[]
}

export interface WatchlistItem {
  id: string
  groupId: string
  stockCode: string
  order: number
  stock: Stock & {
    dividends?: Dividend[]
    prices?: { date: string; close: number }[]
  }
}

/** 排行榜預設篩選組合 */
export interface RankingPreset {
  id: string
  name: string
  filters: {
    yieldGt?: number
    freq?: string
    sector?: string
    streakGte?: number
    fillDaysLte?: number
    marketCapGte?: number
  }
}

export interface Holding {
  id: string
  stockCode: string
  shares: number
  avgCost: number
  stock: Stock
}

export interface AlertRule {
  id: string
  label: string
  type: 'exDiv' | 'payment' | 'fill' | 'yield' | 'drop' | 'announce'
  isOn: boolean
  matchType: 'watchlist' | 'all' | 'specific'
  stockCode?: string
  channels: string[]
  threshold?: number
}

export interface Notification {
  id: string
  type: 'exDiv' | 'payment' | 'fill' | 'news' | 'yield' | 'drop'
  stockCode?: string
  title: string
  body: string
  isRead: boolean
  createdAt: string
}

export interface CalendarEvent {
  id?: string
  date?: string
  exDate?: string | null
  payDate?: string | null
  stockCode: string
  stockName: string
  amount: number
  freq: string
  type: 'exDiv' | 'payment'
  isWatchlist: boolean
}

export interface DashboardSummary {
  todayExDiv: { count: number; codes: string[] }
  weekExDiv: { count: number; watchlistCount: number }
  pendingFill: { count: number; maxDays: number }
  nextPayout: { date: string; estimatedAmount: number }
  accumulatedIncome: number
  yoyPct: number
}

export interface DripInput {
  principal: number
  monthlyAdd: number
  yield: number
  growth: number
  years: number
  taxRate: number
}

export interface DripYearPoint {
  year: number
  assetsWithReinvest: number
  assetsWithoutReinvest: number
  annualDividendWithReinvest: number
  annualDividendWithoutReinvest: number
}

export interface DripResult {
  series: DripYearPoint[]
  targetAchievementYear: number | null
  finalYearAnnualDividend: number
  averageMonthlyIncome: number
}

export interface VizSectorDistribution {
  totalValue: number
  sectors: {
    sector: string
    value: number
    pct: number
  }[]
}

export interface VizMonthlyIncome {
  year: number
  months: {
    month: number
    income: number
  }[]
  annualIncome: number
}

export interface VizHeatmap {
  year: number
  sectors: {
    sector: string
    values: number[]
  }[]
}

export interface VizAnnualGrowth {
  years: {
    year: number
    sectors: Record<string, number>
    total: number
  }[]
}

export interface TweakSettings {
  accent: string
  upRed: boolean
  density: 'compact' | 'cozy' | 'loose'
  monoFont: string
  sansFont: string
  radius: number
}

export interface UserSettings {
  id: string
  userId: string
  accent: string
  upRed: boolean
  density: 'compact' | 'cozy' | 'loose' | string
  monoFont: string
  sansFont: string
  radius: number
}

export interface BrokerLink {
  id: string
  broker: string
  account?: string
  linkedAt: string
}

export interface SyncPreference {
  autoSync: boolean
  positions: boolean
  dividends: boolean
  profile: boolean
  notifications: boolean
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  meta?: {
    total: number
    page: number
    limit: number
  }
}

export interface RankingStock {
  rank: number
  code: string
  name: string
  sector: string
  freq: string
  yield: number
  cash: number
  price: number
  changePct: number
  fillRate: number
  badge?: string
  isEtf: boolean
}
