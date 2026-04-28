import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { MARKET_SYNC_KEY_TWSE_STOCK_PRICE_BACKFILL } from '../data-sync/twse-sync.constants'
import { parseTwseMiIndexQuotes, StockPriceSyncService } from '../data-sync/stock-price-sync.service'
import { formatUtcYmd, parseYmdUtcNoon } from '../data-sync/stock-date.util'
import { CreateHoldingLotDto } from './dto/create-holding-lot.dto'

type DividendRow = { year: number; period: number; freq: string; cash: number; exDate: Date | null; fillDays: number | null; filled: boolean }

const RANGE_DAYS: Record<string, number> = {
  '1D': 1, '1W': 7, '1M': 30, '3M': 90, '6M': 180, '1Y': 365, 'MAX': 1825,
}

/** 單一基準日漲跌幅合理上限（超過視為資料異常，避免誤導使用者） */
const MAX_ABS_DAY_CHANGE_PCT = 100
const TWSE_HOLIDAY_SCHEDULE_URL = 'https://www.twse.com.tw/holidaySchedule/holidaySchedule'

type TwseHolidayScheduleResponse = {
  data?: string[][]
}

type PriceRange = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'MAX'

export type PriceAvailabilityStatus =
  | 'AVAILABLE'
  | 'MISSING_IN_DB'
  | 'SYNC_NOT_READY'
  | 'SOURCE_UNAVAILABLE'

export type StockPriceDiagnostics = {
  status: PriceAvailabilityStatus
  reason: string
  fallbackAttempted: boolean
  lastSyncedTradingDate: string | null
  syncUpdatedAt: string | null
}

export type StockPriceSeriesResponse = {
  data: Array<{
    date: Date
    open: number
    high: number
    low: number
    close: number
    volume: number
  }>
  diagnostics: StockPriceDiagnostics
}

type PriceRow = StockPriceSeriesResponse['data'][number]
/**
 * 將日期轉為 UTC YYYY-MM-DD 鍵值。
 * @param date 日期
 * @returns UTC 日期鍵值
 */
const toUtcDateKey = (date: Date): string => date.toISOString().slice(0, 10)

export type HoldingLotResponse = {
  id: string
  stockCode: string
  buyTimestamp: Date
  buyPrice: number
  buyQuantity: number
}

export type PortfolioAllocationSlice = {
  stockCode: string
  investedAmount: number
  ratio: number
}

export type PortfolioAllocationSummary = {
  totalInvestedAmount: number
  slices: PortfolioAllocationSlice[]
}

/**
 * 判斷 TWSE 休市表列是否為休市日
 * @param name 名稱欄
 * @param description 說明欄
 * @returns 休市日為 true
 */
export const isTwseMarketClosedRow = (name: string, description: string): boolean => {
  const normalizedName = name.trim()
  const normalizedDescription = description.trim()
  if (normalizedName.includes('交易日')) return false
  if (normalizedName.includes('無交易')) return true
  if (normalizedDescription.includes('放假')) return true
  // 其餘非「交易日」事件一律視為休市，避免節日敘述變體漏判
  return true
}

/**
 * 依日期新→舊排列之最新兩筆收盤計算漲跌；不足兩筆或異常比值時回傳零。
 * @param orderedNewestFirst 至多兩筆，索引 0 為最新交易日、索引 1 為前一交易日
 * @returns 漲跌金額與百分比（百分比未四捨五入）
 */
export const computeChangeFromRecentPrices = (
  orderedNewestFirst: ReadonlyArray<{ close: number }>,
): { change: number; changePct: number } => {
  const latest = orderedNewestFirst[0]
  const prev = orderedNewestFirst[1]
  if (!latest || !prev || prev.close <= 0 || !Number.isFinite(latest.close) || !Number.isFinite(prev.close)) {
    return { change: 0, changePct: 0 }
  }
  const change = latest.close - prev.close
  const changePct = (change / prev.close) * 100
  if (!Number.isFinite(changePct) || Math.abs(changePct) > MAX_ABS_DAY_CHANGE_PCT) {
    return { change: 0, changePct: 0 }
  }
  return { change, changePct }
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
  private readonly twseClosedDateCache = new Map<number, string[]>()

  constructor(
    private prisma: PrismaService,
    private priceSync: StockPriceSyncService,
  ) {}

  /**
   * 取得股價同步狀態（最近成功交易日與更新時間）
   * @returns 同步狀態
   */
  private readonly getPriceSyncState = async (): Promise<{
    lastSyncedTradingDate: string | null
    syncUpdatedAt: string | null
  }> => {
    const state = await this.prisma.marketSyncState.findUnique({
      where: { key: MARKET_SYNC_KEY_TWSE_STOCK_PRICE_BACKFILL },
      select: { lastOkDate: true, updatedAt: true },
    })
    return {
      lastSyncedTradingDate: state?.lastOkDate ? formatUtcYmd(state.lastOkDate) : null,
      syncUpdatedAt: state?.updatedAt ? state.updatedAt.toISOString() : null,
    }
  }

  /**
   * 判斷是否可嘗試以 TWSE 同步作為受控 fallback
   * @param args 查詢上下文
   * @returns 可嘗試 fallback 為 true
   */
  private readonly shouldAttemptDbFallback = (args: {
    hasRows: boolean
    range: PriceRange
    lastSyncedTradingDate: string | null
  }): boolean => {
    if (args.hasRows) return false
    if (args.range === 'MAX') return false
    if (!args.lastSyncedTradingDate) return false
    return process.env.STOCK_PRICE_DB_FALLBACK_ENABLED === 'true'
  }

  /**
   * 依查詢結果與同步狀態產生可追蹤診斷
   * @param args 診斷輸入
   * @returns 診斷結果
   */
  private readonly classifyPriceAvailability = (args: {
    hasRows: boolean
    fallbackAttempted: boolean
    fallbackFailed: boolean
    queryStartYmd: string
    lastSyncedTradingDate: string | null
    syncUpdatedAt: string | null
  }): StockPriceDiagnostics => {
    if (args.hasRows) {
      return {
        status: 'AVAILABLE',
        reason: '資料庫已有可用價格資料',
        fallbackAttempted: args.fallbackAttempted,
        lastSyncedTradingDate: args.lastSyncedTradingDate,
        syncUpdatedAt: args.syncUpdatedAt,
      }
    }
    if (args.fallbackFailed) {
      return {
        status: 'SOURCE_UNAVAILABLE',
        reason: '已嘗試外部回補但來源暫時不可用',
        fallbackAttempted: true,
        lastSyncedTradingDate: args.lastSyncedTradingDate,
        syncUpdatedAt: args.syncUpdatedAt,
      }
    }
    if (args.lastSyncedTradingDate && args.queryStartYmd > args.lastSyncedTradingDate) {
      return {
        status: 'SYNC_NOT_READY',
        reason: '查詢區間晚於最近同步交易日，請待排程完成',
        fallbackAttempted: args.fallbackAttempted,
        lastSyncedTradingDate: args.lastSyncedTradingDate,
        syncUpdatedAt: args.syncUpdatedAt,
      }
    }
    return {
      status: 'MISSING_IN_DB',
      reason: '資料庫查無對應區間價格資料',
      fallbackAttempted: args.fallbackAttempted,
      lastSyncedTradingDate: args.lastSyncedTradingDate,
      syncUpdatedAt: args.syncUpdatedAt,
    }
  }

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
    const [stock, recentPrices] = await Promise.all([
      this.prisma.stock.findUniqueOrThrow({
        where: { code },
        include: {
          dividends: {
            orderBy: [{ year: 'desc' }, { period: 'desc' }],
            take: 4,
          },
        },
      }),
      this.prisma.stockPrice.findMany({
        where: { stockCode: code },
        orderBy: { date: 'desc' },
        take: 2,
        select: { date: true, close: true, volume: true },
      }),
    ])

    const latestPrice = recentPrices[0]
    const price = latestPrice?.close ?? 0
    const { change, changePct } = computeChangeFromRecentPrices(recentPrices)

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
   * 查詢資料庫股價序列並轉為 JSON 安全格式
   * @param code 股票代號
   * @param since 查詢起日
   * @returns 股價序列
   */
  private readonly queryPriceRows = async (code: string, since: Date) =>
    (await this.prisma.stockPrice.findMany({
      where: { stockCode: code, date: { gte: since } },
      orderBy: { date: 'asc' },
      select: { date: true, open: true, high: true, low: true, close: true, volume: true },
    })).map((row) => ({
      ...row,
      volume: Number(row.volume),
    }))

  /**
   * 以 TWSE 即時來源嘗試補一筆當日資料（不寫入 DB）
   * @param code 股票代號
   * @param since 查詢起日
   * @returns 可用時回傳一筆資料，否則空陣列
   */
  private readonly querySourceFallbackRows = async (code: string, since: Date): Promise<PriceRow[]> => {
    const raw = await this.priceSync.fetchTwseMiIndexWithRetry(new Date())
    const quote = parseTwseMiIndexQuotes(raw).find((item) => item.code === code)
    if (!quote) return []
    const todayYmd = formatUtcYmd(new Date())
    const todayDate = parseYmdUtcNoon(todayYmd)
    if (todayDate < since) return []
    return [{
      date: todayDate,
      open: quote.open,
      high: quote.high,
      low: quote.low,
      close: quote.close,
      volume: Number(quote.volume),
    }]
  }

  /**
   * 取得個股歷史股價與可追蹤診斷
   * @param code 股票代號
   * @param range 時間範圍，例如 '6M'、'1Y'、'MAX'
   * @returns 股價序列與診斷
   */
  readonly getPriceSeries = async (code: string, range = '6M'): Promise<StockPriceSeriesResponse> => {
    const normalizedRange = (RANGE_DAYS[range] ? range : '6M') as PriceRange
    const days = RANGE_DAYS[normalizedRange] ?? 180
    const since = new Date()
    since.setDate(since.getDate() - days)
    const queryStartYmd = formatUtcYmd(since)
    const syncState = await this.getPriceSyncState()

    let rows = await this.queryPriceRows(code, since)
    let fallbackAttempted = false
    let fallbackFailed = false

    if (this.shouldAttemptDbFallback({
      hasRows: rows.length > 0,
      range: normalizedRange,
      lastSyncedTradingDate: syncState.lastSyncedTradingDate,
    })) {
      fallbackAttempted = true
      try {
        rows = await this.querySourceFallbackRows(code, since)
      } catch {
        fallbackFailed = true
      }
    }

    return {
      data: rows,
      diagnostics: this.classifyPriceAvailability({
        hasRows: rows.length > 0,
        fallbackAttempted,
        fallbackFailed,
        queryStartYmd,
        lastSyncedTradingDate: syncState.lastSyncedTradingDate,
        syncUpdatedAt: syncState.syncUpdatedAt,
      }),
    }
  }

  /**
   * 取得個股歷史股價（舊版陣列格式，相容既有頁面）
   * @param code 股票代號
   * @param range 時間範圍，例如 '6M'、'1Y'、'MAX'
   * @returns 股價序列
   */
  readonly getPrices = async (code: string, range = '6M') => (await this.getPriceSeries(code, range)).data

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
   * 建立使用者持股買入批次。
   * @param userId 使用者 ID
   * @param dto 持股買入輸入
   * @returns 新增後持股批次
   */
  readonly createHoldingLot = async (
    userId: string,
    dto: CreateHoldingLotDto,
  ): Promise<HoldingLotResponse> => {
    const stockExists = await this.prisma.stock.count({
      where: { code: dto.stockCode },
      take: 1,
    })
    if (!stockExists) {
      throw new BadRequestException('無效的股票代號')
    }
    const created = await this.prisma.holdingLot.create({
      data: {
        userId,
        stockCode: dto.stockCode,
        buyTimestamp: dto.buyTimestamp,
        buyPrice: dto.buyPrice,
        buyQuantity: dto.buyQuantity,
      },
      select: {
        id: true,
        stockCode: true,
        buyTimestamp: true,
        buyPrice: true,
        buyQuantity: true,
      },
    })
    return created
  }

  /**
   * 查詢使用者全部持股買入批次。
   * @param userId 使用者 ID
   * @returns 持股買入批次陣列
   */
  readonly listHoldingLots = async (userId: string): Promise<HoldingLotResponse[]> =>
    this.prisma.holdingLot.findMany({
      where: { userId },
      orderBy: [{ buyTimestamp: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        stockCode: true,
        buyTimestamp: true,
        buyPrice: true,
        buyQuantity: true,
      },
    })

  /**
   * 計算投資成本與持股占比切片。
   * @param userId 使用者 ID
   * @returns 投資總額與圓餅圖切片
   */
  readonly getPortfolioAllocation = async (userId: string): Promise<PortfolioAllocationSummary> => {
    const lots = await this.prisma.holdingLot.findMany({
      where: { userId },
      select: { stockCode: true, buyPrice: true, buyQuantity: true },
    })
    const investedByStock = lots.reduce<Record<string, number>>((acc, lot) => {
      const lotInvested = lot.buyPrice * lot.buyQuantity
      acc[lot.stockCode] = (acc[lot.stockCode] ?? 0) + lotInvested
      return acc
    }, {})
    const totalInvestedAmount = Object.values(investedByStock).reduce((sum, amount) => sum + amount, 0)
    const slices = Object.entries(investedByStock)
      .map(([stockCode, investedAmount]) => ({
        stockCode,
        investedAmount,
        ratio: totalInvestedAmount > 0 ? investedAmount / totalInvestedAmount : 0,
      }))
      .sort((a, b) => b.investedAmount - a.investedAmount)
    return { totalInvestedAmount, slices }
  }

  /**
   * 計算自買入日起累積除息收入。
   * @param userId 使用者 ID
   * @returns 累積除息收入
   */
  readonly getDividendIncomeSinceBuy = async (userId: string): Promise<number> => {
    const lots = await this.prisma.holdingLot.findMany({
      where: { userId },
      select: { stockCode: true, buyTimestamp: true, buyQuantity: true },
    })
    if (!lots.length) return 0
    const stockCodes = [...new Set(lots.map((lot) => lot.stockCode))]
    const dividends = await this.prisma.dividend.findMany({
      where: {
        stockCode: { in: stockCodes },
        exDate: { not: null },
      },
      select: { stockCode: true, cash: true, exDate: true },
    })
    return lots.reduce((sum, lot) => {
      const buyDateKey = toUtcDateKey(lot.buyTimestamp)
      const lotIncome = dividends
        .filter((dividend) => dividend.stockCode === lot.stockCode)
        .filter((dividend) => (dividend.exDate ? toUtcDateKey(dividend.exDate) >= buyDateKey : false))
        .reduce((lotSum, dividend) => lotSum + dividend.cash * lot.buyQuantity, 0)
      return sum + lotIncome
    }, 0)
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

  /**
   * 取得指定年度 TWSE 休市日期（YYYY-MM-DD）
   * @param year 西元年
   * @returns 休市日期字串陣列
   */
  readonly getTwseClosedDates = async (year: number): Promise<string[]> => {
    if (this.twseClosedDateCache.has(year)) {
      return this.twseClosedDateCache.get(year) ?? []
    }
    const url = `${TWSE_HOLIDAY_SCHEDULE_URL}?response=json&queryYear=${year}`
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; DividendHub/1.0; +https://github.com/) TradingCalendar',
        },
      })
      if (!res.ok) {
        // 休市標記屬輔助資訊，來源短暫異常時不阻斷主圖資料呈現
        return []
      }
      const raw = await res.json() as TwseHolidayScheduleResponse
      const closedDates = (raw.data ?? [])
        .filter((row) => {
          const name = String(row[1] ?? '')
          const description = String(row[2] ?? '')
          return isTwseMarketClosedRow(name, description)
        })
        .map((row) => String(row[0] ?? '').slice(0, 10))
        .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
      this.twseClosedDateCache.set(year, closedDates)
      return closedDates
    } catch {
      return []
    }
  }
}
