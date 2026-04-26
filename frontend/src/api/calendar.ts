import api from './index'
import type { CalendarEvent } from '@/types'

interface MonthEventFilters {
  watchlistOnly?: boolean
  freq?: string
  yieldGt?: number
}

/**
 * 取得指定年月的所有行事曆事件
 * @param year 西元年
 * @param month 月份（1-12）
 * @param filters 篩選條件
 */
export const getMonthEvents = (
  year: number,
  month: number,
  filters: MonthEventFilters = {},
) =>
  api.get<CalendarEvent[]>('/calendar', {
    params: { year, month, ...filters },
  })

/**
 * 取得未來 N 天的除息事件
 * @param days 往後天數，預設 7
 */
export const getUpcoming = (days = 7) =>
  api.get<CalendarEvent[]>('/calendar/upcoming', { params: { days } })

export const calendarApi = { getMonthEvents, getUpcoming }
