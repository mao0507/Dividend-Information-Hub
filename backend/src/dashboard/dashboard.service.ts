import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import {
  getTaipeiCalendarDayRange,
  getTaipeiCalendarWeekRange,
} from './dashboard-taipei-range.util'

type DashboardCardState = 'ready' | 'empty' | 'stale' | 'error'

interface AccumulatedIncomeCard {
  value: number | null
  yoyPct: number | null
  state: DashboardCardState
  asOf: string | null
}

/**
 * 將日期轉為 UTC YYYY-MM-DD，避免時區造成邊界誤判。
 * @param date 日期
 * @returns UTC 日期鍵值
 */
const toUtcDateKey = (date: Date): string => date.toISOString().slice(0, 10)

/**
 * 儀表板聚合：除息週／日與配息摘要（時間界線以 Asia/Taipei 為準）。
 * CalendarService.getMonthEvents 仍用 `new Date(y, m-1, d)` 之伺服器本地月界；本週除息與今日除息已改為台北日曆週／日（openspec: fix-dashboard-week-ex-div-count）。
 */
@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  /**
   * 取得累積股息收入卡片資料（僅採計已確認入帳資料）。
   * @param now 目前時間
   * @returns 卡片值、YoY、狀態與 asOf
   */
  private getAccumulatedIncomeCard = async (
    userId: string,
    now: Date,
  ): Promise<AccumulatedIncomeCard> => {
    try {
      const holdingLots = await this.prisma.holdingLot.findMany({
        where: { userId },
        select: { stockCode: true, buyTimestamp: true, buyQuantity: true },
      })
      if (!holdingLots.length) {
        return {
          value: null,
          yoyPct: null,
          state: 'empty',
          asOf: now.toISOString(),
        }
      }

      const stockCodes = [...new Set(holdingLots.map((lot) => lot.stockCode))]
      const dividends = await this.prisma.dividend.findMany({
        where: {
          stockCode: { in: stockCodes },
          exDate: { not: null, lte: now },
        },
        select: { stockCode: true, cash: true, exDate: true },
      })

      if (!dividends.length) {
        return {
          value: null,
          yoyPct: null,
          state: 'empty',
          asOf: now.toISOString(),
        }
      }

      const lotIncomes = holdingLots.map((lot) => {
        const buyDateKey = toUtcDateKey(lot.buyTimestamp)
        const eligible = dividends.filter(
          (dividend) =>
            dividend.stockCode === lot.stockCode &&
            dividend.exDate != null &&
            toUtcDateKey(dividend.exDate) >= buyDateKey,
        )
        return eligible.map((dividend) => ({
          amount: dividend.cash * lot.buyQuantity,
          exDate: dividend.exDate as Date,
        }))
      }).flat()

      if (!lotIncomes.length) {
        return {
          value: 0,
          yoyPct: 0,
          state: 'ready',
          asOf: now.toISOString(),
        }
      }

      const currentYear = now.getUTCFullYear()
      const currentYearSum = lotIncomes
        .filter((item) => item.exDate.getUTCFullYear() === currentYear)
        .reduce((sum, item) => sum + item.amount, 0)
      const previousYearSum = lotIncomes
        .filter((item) => item.exDate.getUTCFullYear() === currentYear - 1)
        .reduce((sum, item) => sum + item.amount, 0)
      const totalAccumulatedIncome = lotIncomes.reduce((sum, item) => sum + item.amount, 0)
      const latestPayDate = lotIncomes.reduce<Date | null>(
        (latest, item) => (latest && latest.getTime() > item.exDate.getTime() ? latest : item.exDate),
        null,
      )

      const staleThresholdMs = 370 * 24 * 60 * 60 * 1000
      const isStale =
        latestPayDate == null
          ? true
          : now.getTime() - latestPayDate.getTime() > staleThresholdMs
      const yoyPct =
        previousYearSum > 0 ? ((currentYearSum - previousYearSum) / previousYearSum) * 100 : 0

      return {
        value: Number.isFinite(totalAccumulatedIncome) ? totalAccumulatedIncome : null,
        yoyPct: Number.isFinite(yoyPct) ? yoyPct : null,
        state: isStale ? 'stale' : 'ready',
        asOf: now.toISOString(),
      }
    } catch {
      return {
        value: null,
        yoyPct: null,
        state: 'error',
        asOf: null,
      }
    }
  }

  /**
   * 取得儀表板摘要資料。
   * @param userId 使用者 ID
   * @returns 儀表板摘要
   */
  async getSummary(userId: string) {
    const now = new Date()
    const { dayStart: taipeiTodayStart, dayEnd: taipeiTodayEnd } =
      getTaipeiCalendarDayRange(now)
    const { weekStart, weekEnd } = getTaipeiCalendarWeekRange(now)

    const [todayExDivs, weekExDivs, watchlistCodes] = await Promise.all([
      this.prisma.dividend.findMany({
        where: {
          exDate: { gte: taipeiTodayStart, lte: taipeiTodayEnd },
        },
        select: { stockCode: true },
      }),
      this.prisma.dividend.findMany({
        where: { exDate: { gte: weekStart, lte: weekEnd } },
        select: { stockCode: true },
      }),
      this.prisma.watchlistItem.findMany({
        where: { group: { userId } },
        select: { stockCode: true },
      }),
    ])
    const holdingLots = await this.prisma.holdingLot.findMany({
      where: { userId },
      select: { stockCode: true, buyPrice: true, buyQuantity: true },
    }).catch((): Array<{ stockCode: string; buyPrice: number; buyQuantity: number }> => [])

    const watchlistSet = new Set(watchlistCodes.map((w) => w.stockCode))

    const weekStockCodes = [...new Set(weekExDivs.map((d) => d.stockCode))]
    const weekExDivWatchlistCount = weekStockCodes.filter((code) =>
      watchlistSet.has(code),
    ).length

    const pendingFill = await this.prisma.dividend.findMany({
      where: {
        filled: false,
        exDate: { not: null, lte: taipeiTodayEnd },
      },
      select: { exDate: true },
    })

    const pendingDays = pendingFill.map((d) =>
      Math.floor(
        (taipeiTodayStart.getTime() - d.exDate!.getTime()) /
          (1000 * 60 * 60 * 24),
      ),
    )

    const nextPayout = await this.prisma.dividend.findFirst({
      where: { payDate: { gte: taipeiTodayStart } },
      orderBy: { payDate: 'asc' },
      select: { payDate: true, cash: true },
    })

    const accumulatedIncomeCard = await this.getAccumulatedIncomeCard(userId, now)
    const investedByStockCode = holdingLots.reduce<Record<string, number>>((acc, lot) => {
      acc[lot.stockCode] = (acc[lot.stockCode] ?? 0) + lot.buyPrice * lot.buyQuantity
      return acc
    }, {})
    const totalInvestedAmount = Object.values(investedByStockCode).reduce((sum, amount) => sum + amount, 0)
    const portfolioAllocation = Object.entries(investedByStockCode).map(([stockCode, investedAmount]) => ({
      stockCode,
      investedAmount,
      ratio: totalInvestedAmount > 0 ? investedAmount / totalInvestedAmount : 0,
    }))

    return {
      todayExDiv: {
        count: todayExDivs.length,
        codes: todayExDivs.map((d) => d.stockCode),
      },
      weekExDiv: {
        count: weekStockCodes.length,
        watchlistCount: weekExDivWatchlistCount,
      },
      pendingFill: {
        count: pendingFill.length,
        maxDays: pendingDays.length ? Math.max(...pendingDays) : 0,
      },
      nextPayout: {
        date: nextPayout?.payDate ?? null,
        estimatedAmount: nextPayout?.cash ?? 0,
      },
      accumulatedIncome: accumulatedIncomeCard.value,
      accumulatedIncomeState: accumulatedIncomeCard.state,
      yoyPct: accumulatedIncomeCard.yoyPct,
      asOf: accumulatedIncomeCard.asOf,
      totalInvestedAmount,
      portfolioAllocation,
      dividendIncomeSinceBuy: accumulatedIncomeCard.value ?? 0,
    }
  }
}
