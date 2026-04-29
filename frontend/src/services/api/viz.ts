import api from '../request'
import type {
  VizAnnualGrowth,
  VizHeatmap,
  VizMonthlyIncome,
  VizSectorDistribution,
} from '@/types'

export const vizApi = {
  getSectorDistribution: () =>
    api.get<VizSectorDistribution>('/viz/sector-distribution'),

  getMonthlyIncome: (year: number) =>
    api.get<VizMonthlyIncome>('/viz/monthly-income', { params: { year } }),

  getHeatmap: (year: number) =>
    api.get<VizHeatmap>('/viz/heatmap', { params: { year } }),

  getAnnualGrowth: (years = 6) =>
    api.get<VizAnnualGrowth>('/viz/annual-growth', { params: { years } }),
}
