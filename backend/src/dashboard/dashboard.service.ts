import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary(userId: string) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayEnd = new Date(today)
    todayEnd.setHours(23, 59, 59, 999)

    const weekEnd = new Date(today)
    weekEnd.setDate(weekEnd.getDate() + 7)

    const [todayExDivs, weekExDivs, watchlistCodes] = await Promise.all([
      this.prisma.dividend.findMany({
        where: { exDate: { gte: today, lte: todayEnd } },
        select: { stockCode: true },
      }),
      this.prisma.dividend.findMany({
        where: { exDate: { gte: today, lte: weekEnd } },
        select: { stockCode: true, stock: { select: { name: true } } },
      }),
      this.prisma.watchlistItem.findMany({
        where: { group: { userId } },
        select: { stockCode: true },
      }),
    ])

    const watchlistSet = new Set(watchlistCodes.map((w) => w.stockCode))

    const pendingFill = await this.prisma.dividend.findMany({
      where: { filled: false, exDate: { not: null, lte: today } },
      select: { exDate: true },
    })

    const pendingDays = pendingFill.map((d) =>
      Math.floor((today.getTime() - d.exDate!.getTime()) / (1000 * 60 * 60 * 24)),
    )

    const nextPayout = await this.prisma.dividend.findFirst({
      where: { payDate: { gte: today } },
      orderBy: { payDate: 'asc' },
      select: { payDate: true, cash: true },
    })

    return {
      todayExDiv: {
        count: todayExDivs.length,
        codes: todayExDivs.map((d) => d.stockCode),
      },
      weekExDiv: {
        count: weekExDivs.length,
        watchlistCount: weekExDivs.filter((d) => watchlistSet.has(d.stockCode)).length,
      },
      pendingFill: {
        count: pendingFill.length,
        maxDays: pendingDays.length ? Math.max(...pendingDays) : 0,
      },
      nextPayout: {
        date: nextPayout?.payDate ?? null,
        estimatedAmount: nextPayout?.cash ?? 0,
      },
      accumulatedIncome: 48260,
      yoyPct: 12.4,
    }
  }
}
