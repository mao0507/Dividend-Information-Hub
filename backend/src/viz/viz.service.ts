import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

type CodeShares = { code: string; shares: number }

@Injectable()
export class VizService {
  constructor(private prisma: PrismaService) {}

  /**
   * 取得使用者視覺化分析所需的持股代碼與股數。
   * 若尚未建立 Holding，則以自選股每檔 1 股回退。
   * @param userId 使用者 id
   * @returns 股票代碼與股數
   */
  readonly getUserCodesWithShares = async (userId: string): Promise<CodeShares[]> => {
    const holdings = await this.prisma.holding.findMany({
      where: { userId },
      select: { stockCode: true, shares: true },
    })

    if (holdings.length > 0) {
      return holdings.map((h) => ({ code: h.stockCode, shares: h.shares }))
    }

    const items = await this.prisma.watchlistItem.findMany({
      where: { group: { userId } },
      select: { stockCode: true },
      distinct: ['stockCode'],
    })
    return items.map((i) => ({ code: i.stockCode, shares: 1 }))
  }

  /**
   * 產業分布（依目前市值權重）
   * @param userId 使用者 id
   * @returns 各產業權重與總市值
   */
  readonly getSectorDistribution = async (userId: string) => {
    const codeShares = await this.getUserCodesWithShares(userId)
    if (codeShares.length === 0) return { totalValue: 0, sectors: [] }

    const codes = codeShares.map((c) => c.code)
    const shareMap = new Map(codeShares.map((c) => [c.code, c.shares]))

    const [stocks, prices] = await Promise.all([
      this.prisma.stock.findMany({
        where: { code: { in: codes } },
        select: { code: true, sector: true, name: true },
      }),
      this.prisma.stockPrice.findMany({
        where: { stockCode: { in: codes } },
        orderBy: [{ stockCode: 'asc' }, { date: 'desc' }],
        select: { stockCode: true, close: true },
      }),
    ])

    const priceMap = new Map<string, number>()
    for (const p of prices) {
      if (!priceMap.has(p.stockCode)) priceMap.set(p.stockCode, p.close)
    }

    const sectorValue = new Map<string, number>()
    for (const s of stocks) {
      const px = priceMap.get(s.code) ?? 0
      const shares = shareMap.get(s.code) ?? 0
      const value = px * shares
      sectorValue.set(s.sector, (sectorValue.get(s.sector) ?? 0) + value)
    }

    const totalValue = [...sectorValue.values()].reduce((a, b) => a + b, 0)
    const sectors = [...sectorValue.entries()]
      .map(([sector, value]) => ({
        sector,
        value: Math.round(value),
        pct: totalValue > 0 ? parseFloat(((value / totalValue) * 100).toFixed(2)) : 0,
      }))
      .sort((a, b) => b.value - a.value)

    return { totalValue: Math.round(totalValue), sectors }
  }

  /**
   * 月度股息收入（依 payDate 彙總）
   * @param userId 使用者 id
   * @param year 年份
   * @returns 12 個月份的收入
   */
  readonly getMonthlyIncome = async (userId: string, year: number) => {
    const codeShares = await this.getUserCodesWithShares(userId)
    const months = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, income: 0 }))
    if (codeShares.length === 0) return { year, months, annualIncome: 0 }

    const shareMap = new Map(codeShares.map((c) => [c.code, c.shares]))
    const rows = await this.prisma.dividend.findMany({
      where: {
        stockCode: { in: codeShares.map((c) => c.code) },
        payDate: {
          gte: new Date(year, 0, 1),
          lt: new Date(year + 1, 0, 1),
        },
      },
      select: { stockCode: true, payDate: true, cash: true },
    })

    for (const row of rows) {
      if (!row.payDate) continue
      const month = row.payDate.getMonth()
      const shares = shareMap.get(row.stockCode) ?? 0
      months[month].income += row.cash * shares
    }
    const normalized = months.map((m) => ({ month: m.month, income: Math.round(m.income) }))
    const annualIncome = normalized.reduce((sum, m) => sum + m.income, 0)
    return { year, months: normalized, annualIncome }
  }

  /**
   * 產業 x 月份熱力圖（依 exDate 與股息金額加權）
   * @param userId 使用者 id
   * @param year 年份
   * @returns 產業列與 12 個月強度
   */
  readonly getHeatmap = async (userId: string, year: number) => {
    const codeShares = await this.getUserCodesWithShares(userId)
    if (codeShares.length === 0) return { year, sectors: [] }

    const codes = codeShares.map((c) => c.code)
    const shareMap = new Map(codeShares.map((c) => [c.code, c.shares]))
    const stocks = await this.prisma.stock.findMany({
      where: { code: { in: codes } },
      select: { code: true, sector: true },
    })
    const sectorByCode = new Map(stocks.map((s) => [s.code, s.sector]))

    const rows = await this.prisma.dividend.findMany({
      where: {
        stockCode: { in: codes },
        exDate: {
          gte: new Date(year, 0, 1),
          lt: new Date(year + 1, 0, 1),
        },
      },
      select: { stockCode: true, exDate: true, cash: true },
    })

    const matrix = new Map<string, number[]>()
    for (const row of rows) {
      if (!row.exDate) continue
      const sector = sectorByCode.get(row.stockCode) ?? '其他'
      if (!matrix.has(sector)) matrix.set(sector, Array.from({ length: 12 }, () => 0))
      const month = row.exDate.getMonth()
      const shares = shareMap.get(row.stockCode) ?? 0
      matrix.get(sector)![month] += row.cash * shares
    }

    const sectors = [...matrix.entries()].map(([sector, values]) => ({
      sector,
      values: values.map((v) => Math.round(v)),
    }))
    return { year, sectors }
  }

  /**
   * 年度累計分層成長（依 payDate，按產業累積）
   * @param userId 使用者 id
   * @param years 往回年數
   * @returns 每年各產業收入
   */
  readonly getAnnualGrowth = async (userId: string, years: number) => {
    const codeShares = await this.getUserCodesWithShares(userId)
    const currentYear = new Date().getFullYear()
    const startYear = currentYear - Math.max(1, years) + 1
    const yearList = Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i)
    if (codeShares.length === 0) {
      return { years: yearList.map((year) => ({ year, sectors: {} as Record<string, number>, total: 0 })) }
    }

    const codes = codeShares.map((c) => c.code)
    const shareMap = new Map(codeShares.map((c) => [c.code, c.shares]))
    const stocks = await this.prisma.stock.findMany({
      where: { code: { in: codes } },
      select: { code: true, sector: true },
    })
    const sectorByCode = new Map(stocks.map((s) => [s.code, s.sector]))

    const rows = await this.prisma.dividend.findMany({
      where: {
        stockCode: { in: codes },
        payDate: {
          gte: new Date(startYear, 0, 1),
          lt: new Date(currentYear + 1, 0, 1),
        },
      },
      select: { stockCode: true, payDate: true, cash: true },
    })

    const yearMap = new Map<number, Map<string, number>>()
    for (const y of yearList) yearMap.set(y, new Map())

    for (const row of rows) {
      if (!row.payDate) continue
      const y = row.payDate.getFullYear()
      const bySector = yearMap.get(y)
      if (!bySector) continue
      const sector = sectorByCode.get(row.stockCode) ?? '其他'
      const shares = shareMap.get(row.stockCode) ?? 0
      bySector.set(sector, (bySector.get(sector) ?? 0) + row.cash * shares)
    }

    const series = yearList.map((y) => {
      const bySector = yearMap.get(y) ?? new Map<string, number>()
      const sectors = Object.fromEntries([...bySector.entries()].map(([k, v]) => [k, Math.round(v)]))
      const total = Object.values(sectors).reduce((a, b) => a + b, 0)
      return { year: y, sectors, total }
    })

    return { years: series }
  }
}
