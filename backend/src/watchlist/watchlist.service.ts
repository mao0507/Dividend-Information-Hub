import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class WatchlistService {
  constructor(private prisma: PrismaService) {}

  async getAll(userId: string) {
    return this.prisma.watchlistGroup.findMany({
      where: { userId },
      orderBy: { order: 'asc' },
      include: {
        items: {
          orderBy: { order: 'asc' },
          include: {
            stock: {
              include: {
                dividends: {
                  orderBy: [{ year: 'desc' }, { period: 'desc' }],
                  take: 4,
                },
                prices: {
                  orderBy: { date: 'desc' },
                  take: 24,
                  select: { date: true, close: true },
                },
              },
            },
          },
        },
      },
    })
  }

  async createGroup(userId: string, name: string, color: string) {
    const max = await this.prisma.watchlistGroup.count({ where: { userId } })
    return this.prisma.watchlistGroup.create({
      data: { userId, name, color, order: max },
    })
  }

  async updateGroup(id: string, userId: string, data: { name?: string; color?: string }) {
    await this.prisma.watchlistGroup.findFirstOrThrow({ where: { id, userId } })
    return this.prisma.watchlistGroup.update({ where: { id }, data })
  }

  async deleteGroup(id: string, userId: string) {
    const group = await this.prisma.watchlistGroup.findFirst({
      where: { id, userId },
      include: { _count: { select: { items: true } } },
    })
    if (!group) throw new NotFoundException()
    if (group._count.items > 0) {
      throw new BadRequestException('分組內仍有股票，請先移出後再刪除分組')
    }
    return this.prisma.watchlistGroup.delete({ where: { id } })
  }

  async addItem(groupId: string, stockCode: string, userId: string) {
    await this.prisma.watchlistGroup.findFirstOrThrow({ where: { id: groupId, userId } })
    const max = await this.prisma.watchlistItem.count({ where: { groupId } })
    return this.prisma.watchlistItem.create({
      data: { groupId, stockCode, order: max },
      include: { stock: true },
    })
  }

  async removeItem(id: string, userId: string) {
    const item = await this.prisma.watchlistItem.findFirst({
      where: { id, group: { userId } },
    })
    if (!item) throw new NotFoundException()
    return this.prisma.watchlistItem.delete({ where: { id } })
  }

  async reorder(ids: string[], userId: string) {
    await Promise.all(
      ids.map((id, order) =>
        this.prisma.watchlistItem.updateMany({
          where: { id, group: { userId } },
          data: { order },
        }),
      ),
    )
    return { ok: true }
  }

  async getSummary(userId: string) {
    const items = await this.prisma.watchlistItem.findMany({
      where: { group: { userId } },
      select: { stockCode: true },
    })
    const codes = [...new Set(items.map((i) => i.stockCode))]
    const totalStocks = codes.length

    if (totalStocks === 0) {
      return {
        totalStocks: 0,
        totalValue: 0,
        yearIncome: 0,
        pendingExDiv: 0,
      }
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yearEnd = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999)

    const [holdings, prices, divsThisYear, pendingExRows] = await Promise.all([
      this.prisma.holding.findMany({
        where: { userId, stockCode: { in: codes } },
        select: { stockCode: true, shares: true },
      }),
      this.prisma.stockPrice.findMany({
        where: { stockCode: { in: codes } },
        orderBy: { date: 'desc' },
        select: { stockCode: true, close: true },
      }),
      this.prisma.dividend.findMany({
        where: { stockCode: { in: codes }, year: today.getFullYear() },
        select: { stockCode: true, cash: true },
      }),
      this.prisma.dividend.findMany({
        where: {
          stockCode: { in: codes },
          exDate: { gte: today, lte: yearEnd },
        },
        select: { id: true },
      }),
    ])

    const priceByCode = new Map<string, number>()
    for (const p of prices) {
      if (!priceByCode.has(p.stockCode)) priceByCode.set(p.stockCode, p.close)
    }
    const divSumByCode = divsThisYear.reduce<Map<string, number>>((m, d) => {
      m.set(d.stockCode, (m.get(d.stockCode) ?? 0) + d.cash)
      return m
    }, new Map())

    let totalValue = 0
    let yearIncome = 0
    for (const h of holdings) {
      const px = priceByCode.get(h.stockCode) ?? 0
      totalValue += px * h.shares
      const annual = divSumByCode.get(h.stockCode) ?? 0
      yearIncome += annual * h.shares
    }

    return {
      totalStocks,
      totalValue: Math.round(totalValue),
      yearIncome: Math.round(yearIncome),
      pendingExDiv: pendingExRows.length,
    }
  }
}
