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
  high52w: number
  low52w: number
  updatedAt: string
  latestDividend?: Dividend
  streak: number
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
  stock: StockDetail
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
  yieldPct: number
  growthPct: number
  years: number
  taxRate: number
}

export interface DripResult {
  withReinvest: number[]
  withoutReinvest: number[]
  targetYear?: number
  finalAmount: number
  finalAnnualIncome: number
  finalMonthlyIncome: number
}

export interface TweakSettings {
  accent: string
  upRed: boolean
  density: 'compact' | 'cozy' | 'loose'
  monoFont: string
  sansFont: string
  radius: number
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
