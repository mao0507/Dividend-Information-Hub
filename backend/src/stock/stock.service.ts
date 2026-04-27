import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

type DividendRow = { year: number; period: number; freq: string; cash: number; exDate: Date | null; fillDays: number | null; filled: boolean }

const RANGE_DAYS: Record<string, number> = {
  '1D': 1, '1W': 7, '1M': 30, '3M': 90, '6M': 180, '1Y': 365, 'MAX': 1825,
}

/**
 * 依歷年配息推算連續配息年數（自當年起往回）
 * @param dividends 配息紀錄
 * @param curYear 基準年
 * @returns 連續年數
 */
const countDividendStreak = (dividends: DividendRow[], curYear: number): number => {
  const years = [...new Set(dividends.map((d) => d.year))].sort((a, b) => b - a)
  let streak = 0
  for (let y = curYear; y >= curYear - 40; y--) {
    if (years.includes(y)) streak++
    else break
  }
  return streak
}

/**
 * 以除息後天數與歷史填息天數估算填息進度（0–100）
 * @param d 最近一筆已除息之配息紀錄
 */
const estimateFillRateFromDividend = (d: DividendRow | undefined): number => {
  if (!d?.exDate || d.exDate > new Date()) return 0
  if (d.filled) return 100
  const daysSince = Math.floor((Date.now() - d.exDate.getTime()) / 86_400_000)
  if (d.fillDays && d.fillDays > 0) {
    return Math.min(99, parseFloat(((daysSince / d.fillDays) * 100).toFixed(1)))
  }
  return Math.min(90, daysSince * 4)
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
   * 儀表板 Hero：自選股清單中「第一筆」（依分組 order、組內項目 order）
   * @param userId 使用者 id
   * @returns `{ featured }`；無任何自選股時 `featured` 為 null
   */
  readonly getFeatured = async (userId: string) => {
    const groups = await this.prisma.watchlistGroup.findMany({
      where: { userId },
      orderBy: { order: 'asc' },
      include: {
        items: {
          orderBy: { order: 'asc' },
        },
      },
    })
    for (const g of groups) {
      const first = g.items[0]
      if (first) {
        const detail = await this.getDetail(first.stockCode)
        return { featured: detail }
      }
    }
    return { featured: null }
  }

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
   * 取得排行榜預設篩選組合
   * @returns 預設組合列表
   */
  readonly getRankingPresets = () => [
    { id: 'high-yield', name: '高殖利率 (>5%)', filters: { yieldGt: 5 } },
    { id: 'monthly', name: '月配息', filters: { freq: 'monthly' } },
    { id: 'streak10', name: '連續配息 ≥10 年', filters: { streakGte: 10 } },
    { id: 'fast-fill', name: '填息 ≤15 日', filters: { fillDaysLte: 15 } },
    { id: 'large-cap', name: '大型股（市值 ≥3000 億）', filters: { marketCapGte: 3_000_000_000_000 } },
    { id: 'etf-high', name: '高息 ETF', filters: { sector: 'ETF', yieldGt: 4 } },
  ]

  /**
   * 取得高股息排行榜（全量計算後分頁）
   * @param params 篩選條件與分頁參數
   */
  readonly getRanking = async (params: {
    yieldGt?: number
    freq?: string
    sector?: string
    streakGte?: number
    fillDaysLte?: number
    marketCapGte?: number
    page?: number
    limit?: number
  }) => {
    const { page = 1, limit = 50 } = params
    const curYear = new Date().getFullYear()

    const stocks = await this.prisma.stock.findMany({
      where: params.sector ? { sector: params.sector } : {},
      include: {
        dividends: {
          where: { year: { gte: curYear - 20 } },
          orderBy: [{ year: 'desc' }, { period: 'desc' }],
        },
        prices: { orderBy: { date: 'desc' }, take: 2 },
      },
    })

    const rows = stocks.map((s) => {
      const divs = s.dividends as DividendRow[]
      const latestDiv = divs[0]
      const refYear = latestDiv?.year ?? curYear
      const annualCash = divs.filter((d) => d.year === refYear).reduce((sum, d) => sum + d.cash, 0)

      const price = s.prices[0]?.close ?? 0
      const prevClose = s.prices[1]?.close ?? price
      const changePct = prevClose > 0 ? parseFloat((((price - prevClose) / prevClose) * 100).toFixed(2)) : 0
      const yieldPct = price > 0 ? (annualCash / price) * 100 : 0

      const streak = countDividendStreak(divs, curYear)
      const latestPastDiv = divs.find((d) => d.exDate && d.exDate <= new Date())
      const latestFillDays = latestPastDiv?.fillDays ?? null
      const fillRate = estimateFillRateFromDividend(latestPastDiv ?? latestDiv)

      const cap = s.marketCap !== null ? Number(s.marketCap) : 0

      let badge: string | undefined
      if (yieldPct >= 8) badge = '高息'
      else if (streak >= 10) badge = '長配'
      if (s.isEtf) badge = badge ? `${badge}·ETF` : 'ETF'

      return {
        code: s.code,
        name: s.name,
        sector: s.sector,
        freq: latestDiv?.freq ?? '—',
        yield: parseFloat(yieldPct.toFixed(2)),
        cash: parseFloat(annualCash.toFixed(2)),
        price,
        changePct,
        fillRate,
        badge,
        isEtf: s.isEtf,
        streak,
        latestFillDays,
        marketCapNum: cap,
      }
    })

    const filtered = rows
      .filter((r) => params.yieldGt === undefined || r.yield >= params.yieldGt)
      .filter((r) => !params.freq || r.freq === params.freq)
      .filter((r) => params.streakGte === undefined || r.streak >= params.streakGte)
      .filter(
        (r) =>
          params.fillDaysLte === undefined ||
          (r.latestFillDays !== null && r.latestFillDays <= params.fillDaysLte),
      )
      .filter((r) => params.marketCapGte === undefined || r.marketCapNum >= params.marketCapGte)
      .sort((a, b) => b.yield - a.yield)

    const total = filtered.length
    const skip = (page - 1) * limit
    const slice = filtered.slice(skip, skip + limit).map((r, i) => ({
      rank: skip + i + 1,
      code: r.code,
      name: r.name,
      sector: r.sector,
      freq: r.freq,
      yield: r.yield,
      cash: r.cash,
      price: r.price,
      changePct: r.changePct,
      fillRate: r.fillRate,
      badge: r.badge,
      isEtf: r.isEtf,
    }))

    return { data: slice, total }
  }
}
