import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

const RANGE_DAYS: Record<string, number> = {
  '1D': 1, '1W': 7, '1M': 30, '3M': 90, '6M': 180, '1Y': 365, 'MAX': 1825,
}

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  /**
   * 搜尋股票（代號 / 名稱 / 別名）
   * @param q 搜尋關鍵字
   * @param limit 最多回傳筆數，預設 10
   */
  readonly search = async (q: string, limit = 10) =>
    this.prisma.stock.findMany({
      where: {
        OR: [
          { code: { contains: q, mode: 'insensitive' } },
          { name: { contains: q, mode: 'insensitive' } },
          { nameAlias: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: limit,
      select: { code: true, name: true, sector: true, isEtf: true, market: true },
    })

  /**
   * 取得個股詳細資料，含最新股價與最新配息
   * @param code 股票代號
   */
  readonly getDetail = async (code: string) => {
    const [stock, latestPrice] = await Promise.all([
      this.prisma.stock.findUniqueOrThrow({
        where: { code },
        include: {
          dividends: {
            orderBy: [{ year: 'desc' }, { period: 'desc' }],
            take: 4,
          },
        },
      }),
      this.prisma.stockPrice.findFirst({
        where: { stockCode: code },
        orderBy: { date: 'desc' },
      }),
    ])

    const prevPrice = await this.prisma.stockPrice.findFirst({
      where: { stockCode: code, date: { lt: latestPrice?.date ?? new Date() } },
      orderBy: { date: 'desc' },
    })

    const price = latestPrice?.close ?? 0
    const prevClose = prevPrice?.close ?? price
    const change = price - prevClose
    const changePct = prevClose > 0 ? (change / prevClose) * 100 : 0

    // 計算連續配息年數
    const years = [...new Set(stock.dividends.map((d) => d.year))].sort((a, b) => b - a)
    let streak = 0
    const curYear = new Date().getFullYear()
    for (let y = curYear; y >= curYear - 20; y--) {
      if (years.includes(y)) streak++
      else break
    }

    const latestDiv = stock.dividends[0]
    const annualCash = stock.dividends
      .filter((d) => d.year === (latestDiv?.year ?? curYear))
      .reduce((s, d) => s + d.cash, 0)

    return {
      ...stock,
      price,
      change: parseFloat(change.toFixed(2)),
      changePct: parseFloat(changePct.toFixed(2)),
      volume: Number(latestPrice?.volume ?? 0),
      updatedAt: latestPrice?.date ?? null,
      streak,
      latestDividend: latestDiv ?? null,
      annualCash,
      yieldPct: price > 0 ? parseFloat(((annualCash / price) * 100).toFixed(2)) : 0,
    }
  }

  /**
   * 取得個股配息歷史（依年份/期別升冪排序）
   * @param code 股票代號
   */
  readonly getDividends = async (code: string) =>
    this.prisma.dividend.findMany({
      where: { stockCode: code },
      orderBy: [{ year: 'asc' }, { period: 'asc' }],
    })

  /**
   * 取得個股歷史股價
   * @param code 股票代號
   * @param range 時間範圍，例如 '6M'、'1Y'、'MAX'
   */
  readonly getPrices = async (code: string, range = '6M') => {
    const days = RANGE_DAYS[range] ?? 180
    const since = new Date()
    since.setDate(since.getDate() - days)

    return this.prisma.stockPrice.findMany({
      where: { stockCode: code, date: { gte: since } },
      orderBy: { date: 'asc' },
      select: { date: true, open: true, high: true, low: true, close: true, volume: true },
    })
  }

  /**
   * 取得同產業比較股票（同 sector，最多 6 筆）
   * @param code 股票代號（排除自身）
   */
  readonly getPeers = async (code: string) => {
    const stock = await this.prisma.stock.findUniqueOrThrow({ where: { code } })

    const peers = await this.prisma.stock.findMany({
      where: { sector: stock.sector, code: { not: code } },
      take: 6,
      include: {
        dividends: { orderBy: [{ year: 'desc' }, { period: 'desc' }], take: 1 },
        prices: { orderBy: { date: 'desc' }, take: 1 },
      },
    })

    return peers.map((p) => {
      const price = p.prices[0]?.close ?? 0
      const cash = p.dividends[0]?.cash ?? 0
      return {
        code: p.code,
        name: p.name,
        sector: p.sector,
        price,
        yieldPct: price > 0 ? parseFloat(((cash / price) * 100).toFixed(2)) : 0,
        cash,
        marketCap: p.marketCap,
        isHighlight: p.code === code,
      }
    })
  }

  /**
   * 取得本次除息填息進度
   * @param code 股票代號
   * @returns 除息日、目標價、目前股價、進度百分比、填息天數
   */
  readonly getFillProgress = async (code: string) => {
    const latestDiv = await this.prisma.dividend.findFirst({
      where: { stockCode: code, exDate: { not: null, lte: new Date() } },
      orderBy: [{ year: 'desc' }, { period: 'desc' }],
    })

    if (!latestDiv?.exDate) return null

    const priceAtExDate = await this.prisma.stockPrice.findFirst({
      where: { stockCode: code, date: { lte: latestDiv.exDate } },
      orderBy: { date: 'desc' },
    })

    const currentPrice = await this.prisma.stockPrice.findFirst({
      where: { stockCode: code },
      orderBy: { date: 'desc' },
    })

    const exPrice = priceAtExDate?.close ?? 0
    const targetPrice = exPrice // 填息目標 = 除息前股價
    const nowPrice = currentPrice?.close ?? 0
    const divAmount = latestDiv.cash
    const exDateClose = exPrice - divAmount // 除息後開盤參考價
    const progressPct =
      exDateClose < targetPrice && nowPrice > exDateClose
        ? Math.min(((nowPrice - exDateClose) / divAmount) * 100, 100)
        : nowPrice >= targetPrice
          ? 100
          : 0

    const daysSinceEx = Math.floor(
      (Date.now() - latestDiv.exDate.getTime()) / (1000 * 60 * 60 * 24),
    )

    return {
      exDate: latestDiv.exDate,
      divAmount,
      exPrice,
      targetPrice,
      currentPrice: nowPrice,
      progressPct: parseFloat(progressPct.toFixed(1)),
      daysSinceEx,
      filled: latestDiv.filled,
      fillDays: latestDiv.fillDays,
    }
  }

  /**
   * 取得高股息排行榜
   * @param params 篩選條件與分頁參數
   */
  readonly getRanking = async (params: {
    yieldGt?: number
    freq?: string
    sector?: string
    page?: number
    limit?: number
  }) => {
    const { page = 1, limit = 50 } = params
    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      this.prisma.stock.findMany({
        skip,
        take: limit,
        where: {
          ...(params.sector ? { sector: params.sector } : {}),
        },
        include: {
          dividends: { orderBy: [{ year: 'desc' }, { period: 'desc' }], take: 1 },
          prices: { orderBy: { date: 'desc' }, take: 1 },
        },
      }),
      this.prisma.stock.count(),
    ])

    const ranked = data
      .map((s) => {
        const price = s.prices[0]?.close ?? 0
        const cash = s.dividends[0]?.cash ?? 0
        const yieldPct = price > 0 ? (cash / price) * 100 : 0
        return { ...s, price, cash, yieldPct }
      })
      .filter((s) => !params.yieldGt || s.yieldPct >= params.yieldGt)
      .filter((s) => !params.freq || s.dividends[0]?.freq === params.freq)
      .sort((a, b) => b.yieldPct - a.yieldPct)
      .map((s, i) => ({ ...s, rank: skip + i + 1 }))

    return { data: ranked, total }
  }
}
