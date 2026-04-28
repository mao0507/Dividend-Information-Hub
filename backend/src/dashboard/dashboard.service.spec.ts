import { DashboardService } from './dashboard.service'
import {
  getTaipeiCalendarDayRange,
  getTaipeiCalendarWeekRange,
} from './dashboard-taipei-range.util'

const mockPrisma = {
  dividend: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
  },
  watchlistItem: {
    findMany: jest.fn(),
  },
  holdingLot: {
    findMany: jest.fn(),
  },
} as any

describe('DashboardService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-04-28T12:00:00+08:00'))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  const makeService = () => new DashboardService(mockPrisma)

  it('dedupes weekExDiv by stockCode and counts watchlist intersection', async () => {
    const ref = new Date()
    const { dayStart, dayEnd } = getTaipeiCalendarDayRange(ref)
    const { weekStart, weekEnd } = getTaipeiCalendarWeekRange(ref)

    mockPrisma.dividend.findMany.mockImplementation((args: { where: { exDate?: { gte?: Date; lte?: Date }; filled?: boolean } }) => {
      const w = args.where
      if (w.filled === false) {
        return Promise.resolve([])
      }
      const ex = w.exDate
      if (ex?.gte && ex?.lte && ex.gte.getTime() === dayStart.getTime() && ex.lte.getTime() === dayEnd.getTime()) {
        return Promise.resolve([{ stockCode: '2330' }])
      }
      if (ex?.gte && ex?.lte && ex.gte.getTime() === weekStart.getTime() && ex.lte.getTime() === weekEnd.getTime()) {
        return Promise.resolve([
          { stockCode: '2330' },
          { stockCode: '2330' },
          { stockCode: '0050' },
        ])
      }
      if (w.exDate) {
        return Promise.resolve([
          { stockCode: '2330', cash: 10, exDate: new Date('2026-04-27T00:00:00+08:00') },
          { stockCode: '0050', cash: 5, exDate: new Date('2026-04-20T00:00:00+08:00') },
          { stockCode: '2330', cash: 8, exDate: new Date('2025-04-20T00:00:00+08:00') },
        ])
      }
      return Promise.resolve([])
    })

    mockPrisma.dividend.findFirst.mockResolvedValue(null)
    mockPrisma.watchlistItem.findMany.mockResolvedValue([
      { stockCode: '2330' },
    ])
    mockPrisma.holdingLot.findMany.mockResolvedValue([
      { stockCode: '2330', buyTimestamp: new Date('2025-01-01T00:00:00+08:00'), buyQuantity: 1000, buyPrice: 100 },
      { stockCode: '0050', buyTimestamp: new Date('2025-01-01T00:00:00+08:00'), buyQuantity: 2000, buyPrice: 50 },
    ])

    const svc = makeService()
    const out = await svc.getSummary('user-1')

    expect(out.weekExDiv.count).toBe(2)
    expect(out.weekExDiv.watchlistCount).toBe(1)
    expect(out.todayExDiv.count).toBe(1)
    expect(out.accumulatedIncome).toBe(28000)
    expect(out.accumulatedIncomeState).toBe('ready')
    expect(out.asOf).toBeTruthy()
    expect(out.totalInvestedAmount).toBe(200000)
    expect(out.portfolioAllocation).toHaveLength(2)
  })

  it('returns empty accumulated income when user has no holdings', async () => {
    const ref = new Date()
    const { dayStart, dayEnd } = getTaipeiCalendarDayRange(ref)
    const { weekStart, weekEnd } = getTaipeiCalendarWeekRange(ref)

    mockPrisma.dividend.findMany.mockImplementation((args: { where: { exDate?: { gte?: Date; lte?: Date }; filled?: boolean } }) => {
      const w = args.where
      if (w.exDate || w.filled === false) {
        return Promise.resolve([])
      }
      const ex = w.exDate
      if (!ex?.gte || !ex?.lte) {
        return Promise.resolve([])
      }
      if (
        ex.gte.getTime() === dayStart.getTime() &&
        ex.lte.getTime() === dayEnd.getTime()
      ) {
        return Promise.resolve([])
      }
      if (
        ex.gte.getTime() === weekStart.getTime() &&
        ex.lte.getTime() === weekEnd.getTime()
      ) {
        return Promise.resolve([])
      }
      return Promise.resolve([])
    })
    mockPrisma.dividend.findFirst.mockResolvedValue(null)
    mockPrisma.watchlistItem.findMany.mockResolvedValue([])
    mockPrisma.holdingLot.findMany.mockResolvedValue([])

    const svc = makeService()
    const out = await svc.getSummary('user-1')
    expect(out.accumulatedIncome).toBeNull()
    expect(out.yoyPct).toBeNull()
    expect(out.accumulatedIncomeState).toBe('empty')
    expect(out.asOf).toBeTruthy()
  })

  it('returns stale accumulated income when latest payout is too old', async () => {
    const ref = new Date()
    const { dayStart, dayEnd } = getTaipeiCalendarDayRange(ref)
    const { weekStart, weekEnd } = getTaipeiCalendarWeekRange(ref)

    mockPrisma.dividend.findMany.mockImplementation((args: { where: { exDate?: { gte?: Date; lte?: Date }; filled?: boolean } }) => {
      const w = args.where
      if (w.filled === false) {
        return Promise.resolve([])
      }
      const ex = w.exDate
      if (ex?.gte && ex?.lte && ex.gte.getTime() === dayStart.getTime() && ex.lte.getTime() === dayEnd.getTime()) {
        return Promise.resolve([])
      }
      if (ex?.gte && ex?.lte && ex.gte.getTime() === weekStart.getTime() && ex.lte.getTime() === weekEnd.getTime()) {
        return Promise.resolve([])
      }
      if (w.exDate) {
        return Promise.resolve([
          { stockCode: '2330', cash: 10, exDate: new Date('2024-01-10T00:00:00+08:00') },
        ])
      }
      return Promise.resolve([])
    })
    mockPrisma.dividend.findFirst.mockResolvedValue(null)
    mockPrisma.watchlistItem.findMany.mockResolvedValue([])
    mockPrisma.holdingLot.findMany.mockResolvedValue([
      { stockCode: '2330', buyTimestamp: new Date('2023-01-01T00:00:00+08:00'), buyQuantity: 1000, buyPrice: 100 },
    ])

    const svc = makeService()
    const out = await svc.getSummary('user-1')
    expect(out.accumulatedIncome).toBe(10000)
    expect(out.accumulatedIncomeState).toBe('stale')
  })

  it('returns error accumulated income when confirmed query fails', async () => {
    const ref = new Date()
    const { dayStart, dayEnd } = getTaipeiCalendarDayRange(ref)
    const { weekStart, weekEnd } = getTaipeiCalendarWeekRange(ref)

    mockPrisma.dividend.findMany.mockImplementation((args: { where: { exDate?: { gte?: Date; lte?: Date }; filled?: boolean } }) => {
      const w = args.where
      if (w.filled === false) {
        return Promise.resolve([])
      }
      const ex = w.exDate
      if (ex?.gte && ex?.lte && ex.gte.getTime() === dayStart.getTime() && ex.lte.getTime() === dayEnd.getTime()) {
        return Promise.resolve([])
      }
      if (ex?.gte && ex?.lte && ex.gte.getTime() === weekStart.getTime() && ex.lte.getTime() === weekEnd.getTime()) {
        return Promise.resolve([])
      }
      if (w.exDate) {
        return Promise.reject(new Error('db error'))
      }
      return Promise.resolve([])
    })
    mockPrisma.dividend.findFirst.mockResolvedValue(null)
    mockPrisma.watchlistItem.findMany.mockResolvedValue([])
    mockPrisma.holdingLot.findMany.mockResolvedValue([
      { stockCode: '2330', buyTimestamp: new Date('2023-01-01T00:00:00+08:00'), buyQuantity: 1000, buyPrice: 100 },
    ])

    const svc = makeService()
    const out = await svc.getSummary('user-1')
    expect(out.accumulatedIncome).toBeNull()
    expect(out.yoyPct).toBeNull()
    expect(out.accumulatedIncomeState).toBe('error')
    expect(out.asOf).toBeNull()
  })
})
