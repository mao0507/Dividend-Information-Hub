import api from './index'
import type { DashboardSummary, CalendarEvent } from '@/types'

export const dashboardApi = {
  getSummary: () =>
    api.get<DashboardSummary>('/dashboard/summary'),

  getUpcoming: (days = 7) =>
    api.get<CalendarEvent[]>('/calendar/upcoming', { params: { days } }),
}
