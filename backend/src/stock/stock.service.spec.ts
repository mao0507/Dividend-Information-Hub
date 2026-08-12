import {
  StockService,
  computeChangeFromRecentPrices,
  isTwseMarketClosedRow,
} from './stock.service'

describe('computeChangeFromRecentPrices', () => {
  it('returns zeros when fewer than 2 rows', () => {
    expect(computeChangeFromRecentPrices([])).toEqual({ change: 0, changePct: 0 })
    expect(computeChangeFromRecentPrices([{ close: 100 }])).toEqual({ change: 0, changePct: 0 })
  })

  it('computes change from latest two closes', () => {
    expect(
      computeChangeFromRecentPrices([{ close: 102 }, { close: 100 }]),
    ).toEqual({ change: 2, changePct: 2 })
  })

  it('returns zeros when daily move exceeds sanity threshold', () => {
    expect(
      computeChangeFromRecentPrices([{ close: 1200 }, { close: 100 }]),
    ).toEqual({ change: 0, changePct: 0 })
  })
})

describe('isTwseMarketClosedRow', () => {
  it('returns false for trading marker rows', () => {
    expect(isTwseMarketClosedRow('國曆新年開始交易日', '國曆新年開始交易。')).toBe(false)
    expect(isTwseMarketClosedRow('農曆春節前最後交易日', '農曆春節前最後交易。')).toBe(false)
  })

  it('returns true for market closed rows', () => {
    expect(isTwseMarketClosedRow('市場無交易，僅辦理結算交割作業', '')).toBe(true)
    expect(isTwseMarketClosedRow('端午節', '依規定放假1日。')).toBe(true)
    expect(isTwseMarketClosedRow('兒童節及民族掃墓節', '民族掃墓節補假。')).toBe(true)
  })
})

describe('StockService.getDetail', () => {
  const mockPrisma = {
    stock: { findUniqueOrThrow: jest.fn() },
    stockPrice: { findMany: jest.fn() },
  }
  const mockPriceSync = { syncDate: jest.fn(), fetchTwseMiIndexWithRetry: jest.fn() }

  const service = new StockService(mockPrisma as never, mockPriceSync as never)

  const baseStock = {
    code: '2330',
    name: '台積電',
    nameAlias: null as string | null,
    sector: '半導體',
    market: 'TWSE',
    isEtf: false,
    pe: null as number | null,
    marketCap: null as bigint | null,
    updatedAt: new Date('2026-04-27T00:00:00.000Z'),
    dividends: [] as never[],
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns zero change when only one price row exists', async () => {
    mockPrisma.stock.findUniqueOrThrow.mockResolvedValue(baseStock)
    mockPrisma.stockPrice.findMany.mockResolvedValue([
      { date: new Date('2026-04-27'), close: 500, volume: BigInt(1000) },
    ])

    const detail = await service.getDetail('2330')

    expect(detail.price).toBe(500)
    expect(detail.change).toBe(0)
    expect(detail.changePct).toBe(0)
  })

  it('uses second row as previous close when two rows exist', async () => {
    mockPrisma.stock.findUniqueOrThrow.mockResolvedValue(baseStock)
    mockPrisma.stockPrice.findMany.mockResolvedValue([
      { date: new Date('2026-04-27'), close: 102, volume: BigInt(1000) },
      { date: new Date('2026-04-26'), close: 100, volume: BigInt(900) },
    ])

    const detail = await service.getDetail('2330')

    expect(detail.price).toBe(102)
    expect(detail.change).toBe(2)
    expect(detail.changePct).toBe(2)
  })
})

describe('StockService.getPrices', () => {
  const mockPrisma = {
    stockPrice: { findMany: jest.fn() },
    marketSyncState: { findUnique: jest.fn() },
  }
  const mockPriceSync = { syncDate: jest.fn(), fetchTwseMiIndexWithRetry: jest.fn() }
  const service = new StockService(mockPrisma as never, mockPriceSync as never)

  beforeEach(() => {
    jest.clearAllMocks()
    mockPrisma.marketSyncState.findUnique.mockResolvedValue({
      lastOkDate: new Date('2026-04-25'),
      updatedAt: new Date('2026-04-25T15:00:00.000Z'),
    })
  })

  it('converts bigint volume to number for JSON safety', async () => {
    mockPrisma.stockPrice.findMany.mockResolvedValue([
      {
        date: new Date('2026-04-27'),
        open: 100,
        high: 101,
        low: 99,
        close: 100.5,
        volume: BigInt(1234567),
      },
    ])

    const prices = await service.getPrices('2330', '1M')

    expect(prices).toEqual([
      {
        date: new Date('2026-04-27'),
        open: 100,
        high: 101,
        low: 99,
        close: 100.5,
        volume: 1234567,
      },
    ])
  })

  it('marks sync not ready when db is empty and query range is newer than last synced date', async () => {
    mockPrisma.marketSyncState.findUnique.mockResolvedValue({
      lastOkDate: new Date('2020-01-01'),
      updatedAt: new Date('2020-01-01T12:00:00.000Z'),
    })
    mockPrisma.stockPrice.findMany.mockResolvedValue([])

    const result = await service.getPriceSeries('2330', '1W')

    expect(result.data).toEqual([])
    expect(result.diagnostics.status).toBe('SYNC_NOT_READY')
    expect(mockPriceSync.fetchTwseMiIndexWithRetry).not.toHaveBeenCalled()
  })

  it('attempts fallback sync when enabled and returns source unavailable on sync failure', async () => {
    process.env.STOCK_PRICE_DB_FALLBACK_ENABLED = 'true'
    mockPrisma.stockPrice.findMany.mockResolvedValue([])
    mockPriceSync.fetchTwseMiIndexWithRetry.mockRejectedValue(new Error('twse down'))

    const result = await service.getPriceSeries('2330', '6M')

    expect(mockPriceSync.fetchTwseMiIndexWithRetry).toHaveBeenCalledTimes(1)
    expect(mockPriceSync.syncDate).not.toHaveBeenCalled()
    expect(result.diagnostics.status).toBe('SOURCE_UNAVAILABLE')
    delete process.env.STOCK_PRICE_DB_FALLBACK_ENABLED
  })

  it('returns data when fallback source has same-day quote', async () => {
    process.env.STOCK_PRICE_DB_FALLBACK_ENABLED = 'true'
    mockPrisma.stockPrice.findMany.mockResolvedValue([])
    mockPriceSync.fetchTwseMiIndexWithRetry.mockResolvedValue({
      stat: 'OK',
      tables: [
        {
          fields: ['證券代號', '成交股數', '開盤價', '最高價', '最低價', '收盤價'],
          data: [['2330', '1,234', '100', '101', '99', '100.5']],
        },
      ],
    })

    const result = await service.getPriceSeries('2330', '6M')

    expect(mockPriceSync.fetchTwseMiIndexWithRetry).toHaveBeenCalledTimes(1)
    expect(mockPriceSync.syncDate).not.toHaveBeenCalled()
    expect(result.data).toHaveLength(1)
    expect(result.diagnostics.status).toBe('AVAILABLE')
    expect(result.diagnostics.fallbackAttempted).toBe(true)
    delete process.env.STOCK_PRICE_DB_FALLBACK_ENABLED
  })

  it('returns TAIEX candle via parseTwseMiIndexTaiex when code is TAIEX and DB is empty', async () => {
    process.env.STOCK_PRICE_DB_FALLBACK_ENABLED = 'true'
    mockPrisma.stockPrice.findMany.mockResolvedValue([])
    mockPriceSync.fetchTwseMiIndexWithRetry.mockResolvedValue({
      stat: 'OK',
      tables: [
        {
          fields: ['指數', '收盤指數'],
          data: [['發行量加權股價指數', '20,000.00']],
        },
      ],
    })

    const result = await service.getPriceSeries('TAIEX', '6M')

    expect(mockPriceSync.fetchTwseMiIndexWithRetry).toHaveBeenCalledTimes(1)
    expect(result.data).toHaveLength(1)
    expect(result.data[0].close).toBe(20000)
    expect(result.data[0].open).toBe(20000)
    expect(result.data[0].high).toBe(20000)
    expect(result.data[0].low).toBe(20000)
    expect(result.diagnostics.status).toBe('AVAILABLE')
    delete process.env.STOCK_PRICE_DB_FALLBACK_ENABLED
  })

  it('returns empty array when TAIEX code is requested but parseTwseMiIndexTaiex returns null', async () => {
    process.env.STOCK_PRICE_DB_FALLBACK_ENABLED = 'true'
    mockPrisma.stockPrice.findMany.mockResolvedValue([])
    mockPriceSync.fetchTwseMiIndexWithRetry.mockResolvedValue({ stat: 'NO_DATA', tables: [] })

    const result = await service.getPriceSeries('TAIEX', '6M')

    expect(result.data).toHaveLength(0)
    delete process.env.STOCK_PRICE_DB_FALLBACK_ENABLED
  })
})

describe('StockService.getRanking', () => {
  const mockPrisma = {
    stock: { findMany: jest.fn() },
  }
  const mockPriceSync = { syncDate: jest.fn(), fetchTwseMiIndexWithRetry: jest.fn() }

  const makeStock = (overrides: Record<string, unknown> = {}) => ({
    code: '2330',
    name: '台積電',
    sector: '半導體',
    isEtf: false,
    marketCap: null,
    dividends: [
      { year: 2025, period: 1, freq: 'yearly', cash: 20, exDate: new Date('2025-07-01'), fillDays: 5, filled: true },
      { year: 2024, period: 1, freq: 'yearly', cash: 18, exDate: new Date('2024-07-01'), fillDays: 5, filled: true },
    ],
    prices: [{ close: 500 }, { close: 490 }],
    ...overrides,
  })

  const makeService = () => new StockService(mockPrisma as never, mockPriceSync as never)

  beforeEach(() => jest.clearAllMocks())

  it('回傳多年殖利率趨勢，依年份由舊到新排序', async () => {
    mockPrisma.stock.findMany.mockResolvedValue([makeStock()])

    const result = await makeService().getRanking({})

    const row = result.data[0]
    expect(row.yieldTrend).toEqual([
      { year: 2024, yieldPct: parseFloat(((18 / 500) * 100).toFixed(2)) },
      { year: 2025, yieldPct: parseFloat(((20 / 500) * 100).toFixed(2)) },
    ])
  })

  it('無 EPS 資料時 payoutRatio 為 null 並註明原因，不阻擋其他欄位輸出', async () => {
    mockPrisma.stock.findMany.mockResolvedValue([makeStock()])

    const result = await makeService().getRanking({})

    const row = result.data[0]
    expect(row.payoutRatio).toBeNull()
    expect(row.payoutRatioUnavailableReason).toBe('epsUnavailable')
    expect(row.yield).toBeGreaterThan(0)
  })

  it('同產業內依殖利率排序計算 sectorRank', async () => {
    mockPrisma.stock.findMany.mockResolvedValue([
      makeStock({ code: '2330', dividends: [{ year: 2025, period: 1, freq: 'yearly', cash: 10, exDate: new Date('2025-07-01'), fillDays: 5, filled: true }], prices: [{ close: 500 }] }), // yield 2%
      makeStock({ code: '2454', name: '聯發科', dividends: [{ year: 2025, period: 1, freq: 'yearly', cash: 50, exDate: new Date('2025-07-01'), fillDays: 5, filled: true }], prices: [{ close: 500 }] }), // yield 10%
    ])

    const result = await makeService().getRanking({})

    const mtk = result.data.find((r) => r.code === '2454')!
    const tsmc = result.data.find((r) => r.code === '2330')!
    expect(mtk.sectorRank).toBe(1)
    expect(tsmc.sectorRank).toBe(2)
  })

  it('payoutRatioLte 篩選時，目前無 EPS 資料故一律排除（過渡行為，待 EPS 資料源補齊）', async () => {
    mockPrisma.stock.findMany.mockResolvedValue([makeStock()])

    const result = await makeService().getRanking({ payoutRatioLte: 80 })

    expect(result.data).toHaveLength(0)
  })
})

describe('StockService.getTwseClosedDates', () => {
  const mockPrisma = {
    stockPrice: { findMany: jest.fn() },
  }
  const mockPriceSync = { syncDate: jest.fn(), fetchTwseMiIndexWithRetry: jest.fn() }
  const service = new StockService(mockPrisma as never, mockPriceSync as never)
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
    jest.restoreAllMocks()
  })

  it('returns empty list instead of throwing when TWSE API is unavailable', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 307 }) as never

    await expect(service.getTwseClosedDates(2026)).resolves.toEqual([])
  })

  it('returns empty list when fetch throws network error', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network')) as never

    await expect(service.getTwseClosedDates(2026)).resolves.toEqual([])
  })
})

