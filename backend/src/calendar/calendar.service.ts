import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class CalendarService {
  constructor(private prisma: PrismaService) {}

  async getMonthEvents(year: number, month: number, userId: string) {
    const start = new Date(year, month - 1, 1)
    const end = new Date(year, month, 0, 23, 59, 59)

    const watchlistCodes = await this.prisma.watchlistItem.findMany({
      where: { group: { userId } },
      select: { stockCode: true },
    })
    const watchlistSet = new Set(watchlistCodes.map((w) => w.stockCode))

    const dividends = await this.prisma.dividend.findMany({
      where: {
        OR: [
          { exDate: { gte: start, lte: end } },
          { payDate: { gte: start, lte: end } },
        ],
      },
      include: { stock: { select: { name: true } } },
    })

    return dividends.map((d) => ({
      id: d.id,
      stockCode: d.stockCode,
      stockName: d.stock.name,
      amount: d.cash,
      freq: d.freq,
      exDate: d.exDate,
      payDate: d.payDate,
      isWatchlist: watchlistSet.has(d.stockCode),
    }))
  }

  async getUpcoming(days: number, userId: string) {
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
      type: 'exDiv',
      isWatchlist: watchlistSet.has(d.stockCode),
    }))
  }
}
