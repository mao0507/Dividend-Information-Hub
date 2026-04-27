import api from './index'
import type { StockDetail, Dividend, RankingStock, RankingPreset } from '@/types'

export const stockApi = {
  search: (q: string, limit = 10) =>
    api.get<StockDetail[]>('/stocks', { params: { q, limit } }),

  getFeatured: () => api.get<{ featured: StockDetail | null }>('/stocks/featured'),

  getDetail: (code: string) =>
    api.get<StockDetail>(`/stocks/${code}`),

  getDividends: (code: string) =>
    api.get<Dividend[]>(`/stocks/${code}/dividends`),

  getPrice: (code: string, range = '6M') =>
    api.get<{ date: string; close: number; volume: number }[]>(
      `/stocks/${code}/price`,
      { params: { range } },
    ),

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
}
