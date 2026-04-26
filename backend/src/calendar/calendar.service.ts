import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

export interface MonthEventFilters {
  watchlistOnly?: boolean
  freq?: string
  yieldGt?: number
}

export interface CalendarEvent {
  id: string
  stockCode: string
  stockName: string
  amount: number
  freq: string
  exDate: Date | null
  payDate: Date | null
  isWatchlist: boolean
}

export interface UpcomingEvent {
  date: Date | null
  stockCode: string
  stockName: string
  amount: number
  freq: string
  type: 'exDiv'
  isWatchlist: boolean
}

@Injectable()
export class CalendarService {
  constructor(private prisma: PrismaService) {}

  /**
   * 取得指定年月的所有除息/配息事件
   * @param year 西元年
   * @param month 月份（1-12）
   * @param userId 目前登入使用者 ID
   * @param filters 篩選條件（watchlistOnly / freq / yieldGt）
   * @returns 行事曆事件陣列
   */
  readonly getMonthEvents = async (
    year: number,
    month: number,
    userId: string,
    filters: MonthEventFilters = {},
  ): Promise<CalendarEvent[]> => {
    const start = new Date(year, month - 1, 1)
    const end = new Date(year, month, 0, 23, 59, 59)

    const watchlistCodes = await this.prisma.watchlistItem.findMany({
      where: { group: { userId } },
      select: { stockCode: true },
    })
    const watchlistSet = new Set(watchlistCodes.map((w) => w.stockCode))

    const stockFilter = filters.watchlistOnly
      ? { stockCode: { in: [...watchlistSet] } }
      : {}

    const freqFilter = filters.freq ? { freq: filters.freq } : {}

    const dividends = await this.prisma.dividend.findMany({
      where: {
        ...stockFilter,
        ...freqFilter,
        OR: [
          { exDate: { gte: start, lte: end } },
          { payDate: { gte: start, lte: end } },
        ],
      },
      include: { stock: { select: { name: true, prices: { orderBy: { date: 'desc' }, take: 1 } } } },
    })

    const results = dividends.map((d) => ({
      id: d.id,
      stockCode: d.stockCode,
      stockName: d.stock.name,
      amount: d.cash,
      freq: d.freq,
      exDate: d.exDate,
      payDate: d.payDate,
      isWatchlist: watchlistSet.has(d.stockCode),
    }))

    if (filters.yieldGt) {
      return results.filter((r) => {
        const price = dividends.find((d) => d.stockCode === r.stockCode)
          ?.stock.prices[0]?.close ?? 0
        return price > 0 && (r.amount / price) * 100 >= filters.yieldGt!
      })
    }

    return results
  }

  /**
   * 取得未來 N 天的除息事件
   * @param days 往後天數
   * @param userId 目前登入使用者 ID
   * @returns 依除息日排序的事件陣列
   */
  readonly getUpcoming = async (days: number, userId: string): Promise<UpcomingEvent[]> => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setDate(end.getDate() + days)

    const watchlistCodes = await this.prisma.watchlistItem.findMany({
      where: { group: { userId } },
      select: { stockCode: true },
    })
    const watchlistSet = new Set(watchlistCodes.map((w) => w.stockCode))

    const dividends = await this.prisma.dividend.findMany({
      where: { exDate: { gte: start, lte: end } },
      include: { stock: { select: { name: true } } },
      orderBy: { exDate: 'asc' },
    })

    return dividends.map((d) => ({
      date: d.exDate,
      stockCode: d.stockCode,
      stockName: d.stock.name,
      amount: d.cash,
      freq: d.freq,
      type: 'exDiv' as const,
      isWatchlist: watchlistSet.has(d.stockCode),
    }))
  }
}
