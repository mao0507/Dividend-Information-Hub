import { Injectable, NotFoundException } from '@nestjs/common'
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
                  take: 1,
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
    await this.prisma.watchlistGroup.findFirstOrThrow({ where: { id, userId } })
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
    const groups = await this.prisma.watchlistGroup.findMany({
      where: { userId },
      include: { items: { select: { stockCode: true } } },
    })
    const totalStocks = groups.reduce((a, g) => a + g.items.length, 0)
    return {
      totalStocks,
      totalValue: 0,
      yearIncome: 48260,
      pendingExDiv: 5,
    }
  }
}
