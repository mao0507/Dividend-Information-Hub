import api from './index'
import type {
  StockDetail,
  Dividend,
  OhlcvPoint,
  RankingStock,
  RankingPreset,
  StockPriceSeries,
  HoldingLot,
} from '@/types'

const twseClosedDateCache = new Map<number, string[]>()

export const stockApi = {
  search: (q: string, limit = 10) =>
    api.get<StockDetail[]>('/stocks', { params: { q, limit } }),

  getFeatured: () => api.get<{ featured: StockDetail | null }>('/stocks/featured'),

  getDetail: (code: string) =>
    api.get<StockDetail>(`/stocks/${code}`),

  getDividends: (code: string) =>
    api.get<Dividend[]>(`/stocks/${code}/dividends`),

  getPrice: (code: string, range = '6M') =>
    api.get<OhlcvPoint[]>(
      `/stocks/${code}/price`,
      { params: { range } },
    ),

  getPriceSeries: (code: string, range = '6M') =>
    api.get<StockPriceSeries>(
      `/stocks/${code}/price-series`,
      { params: { range } },
    ),

  getTwseClosedDates: async (year: number): Promise<string[]> => {
    if (twseClosedDateCache.has(year)) {
      return twseClosedDateCache.get(year) ?? []
    }
    const res = await api.get<string[]>('/stocks/trading-calendar/closed-dates', {
      params: { year },
    })
    twseClosedDateCache.set(year, res.data)
    return res.data
  },

  getPeers: (code: string) =>
    api.get<StockDetail[]>(`/stocks/${code}/peers`),

  getFillProgress: (code: string) =>
    api.get<{ pct: number; days: number; remaining: number }>(
      `/stocks/${code}/fill-progress`,
    ),

  getRanking: (params: {
    yieldGt?: number
    freq?: string
    sector?: string
    streakGte?: number
    fillDaysLte?: number
    marketCapGte?: number
    page?: number
    limit?: number
  }) => api.get<{ data: RankingStock[]; total: number }>('/stocks/ranking', { params }),

  getRankingPresets: () => api.get<RankingPreset[]>('/stocks/ranking/presets'),

  createHoldingLot: (payload: {
    stockCode: string
    buyTimestamp: string
    buyPrice: number
    buyQuantity: number
  }) => api.post<HoldingLot>('/stocks/holdings/lots', payload),

  getHoldingLots: () => api.get<HoldingLot[]>('/stocks/holdings/lots'),

  getPortfolioAllocation: () =>
    api.get<{
      totalInvestedAmount: number
      slices: Array<{ stockCode: string; investedAmount: number; ratio: number }>
    }>('/stocks/holdings/allocation'),

  getDividendIncomeSinceBuy: () =>
    api.get<number>('/stocks/holdings/dividend-income-since-buy'),
}
