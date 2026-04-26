import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  async search(q: string, limit = 10) {
    return this.prisma.stock.findMany({
      where: {
        OR: [
          { code: { contains: q, mode: 'insensitive' } },
          { name: { contains: q, mode: 'insensitive' } },
          { nameAlias: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: limit,
    })
  }

  async getDetail(code: string) {
    return this.prisma.stock.findUniqueOrThrow({
      where: { code },
      include: {
        dividends: {
          orderBy: [{ year: 'desc' }, { period: 'desc' }],
          take: 1,
        },
      },
    })
  }

  async getDividends(code: string) {
    return this.prisma.dividend.findMany({
      where: { stockCode: code },
      orderBy: [{ year: 'asc' }, { period: 'asc' }],
    })
  }

  async getPrices(code: string, range = '6M') {
    const rangeMap: Record<string, number> = {
      '1D': 1, '1W': 7, '1M': 30, '6M': 180, '1Y': 365, '5Y': 1825,
    }
    const days = rangeMap[range] ?? 180
    const since = new Date()
    since.setDate(since.getDate() - days)

    return this.prisma.stockPrice.findMany({
      where: { stockCode: code, date: { gte: since } },
      orderBy: { date: 'asc' },
      select: { date: true, close: true, volume: true, open: true, high: true, low: true },
    })
  }

  async getPeers(code: string) {
    const stock = await this.prisma.stock.findUniqueOrThrow({ where: { code } })
    return this.prisma.stock.findMany({
      where: { sector: stock.sector, code: { not: code } },
      take: 6,
      include: {
        dividends: {
          orderBy: [{ year: 'desc' }, { period: 'desc' }],
          take: 1,
        },
      },
    })
  }

  async getRanking(params: {
    yieldGt?: number
    freq?: string
    sector?: string
    streakGte?: number
    page?: number
    limit?: number
  }) {
    const { page = 1, limit = 50 } = params
    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      this.prisma.stock.findMany({
        skip,
        take: limit,
        include: {
          dividends: {
            orderBy: [{ year: 'desc' }, { period: 'desc' }],
            take: 1,
          },
        },
      }),
      this.prisma.stock.count(),
    ])

    return { data, total }
  }
}
