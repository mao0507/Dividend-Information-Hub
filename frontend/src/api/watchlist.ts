import api from './index'
import type { WatchlistGroup } from '@/types'

export const watchlistApi = {
  getAll: () => api.get<WatchlistGroup[]>('/watchlist'),

  createGroup: (name: string, color: string) =>
    api.post('/watchlist/groups', { name, color }),

  updateGroup: (id: string, data: { name?: string; color?: string }) =>
    api.patch(`/watchlist/groups/${id}`, data),

  deleteGroup: (id: string) => api.delete(`/watchlist/groups/${id}`),

  addItem: (groupId: string, stockCode: string) =>
    api.post('/watchlist/items', { groupId, stockCode }),

  removeItem: (id: string) => api.delete(`/watchlist/items/${id}`),

  reorder: (ids: string[]) =>
    api.patch('/watchlist/items/reorder', { ids }),

  getSummary: () =>
    api.get<{
      totalStocks: number
      totalValue: number
      yearIncome: number
      pendingExDiv: number
    }>('/watchlist/summary'),
}
