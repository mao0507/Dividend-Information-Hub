import { Test } from '@nestjs/testing'
import { VizService } from './viz.service'
import { PrismaService } from '../prisma/prisma.service'

describe('VizService', () => {
  let svc: VizService
  let prisma: {
    holding: { findMany: jest.Mock }
    watchlistItem: { findMany: jest.Mock }
    stock: { findMany: jest.Mock }
    stockPrice: { findMany: jest.Mock }
    dividend: { findMany: jest.Mock }
  }

  beforeEach(async () => {
    prisma = {
      holding: { findMany: jest.fn().mockResolvedValue([]) },
      watchlistItem: { findMany: jest.fn().mockResolvedValue([]) },
      stock: { findMany: jest.fn().mockResolvedValue([]) },
      stockPrice: { findMany: jest.fn().mockResolvedValue([]) },
      dividend: { findMany: jest.fn().mockResolvedValue([]) },
    }

    const mod = await Test.createTestingModule({
      providers: [VizService, { provide: PrismaService, useValue: prisma }],
    }).compile()

    svc = mod.get(VizService)
  })

  afterEach(() => jest.clearAllMocks())

  describe('getUserCodesWithShares()', () => {
    it('有 Holding 時直接回傳持股代碼與股數', async () => {
      prisma.holding.findMany.mockResolvedValue([{ stockCode: '2330', shares: 100 }])

      const result = await svc.getUserCodesWithShares('user-1')

      expect(result).toEqual([{ code: '2330', shares: 100 }])
      expect(prisma.watchlistItem.findMany).not.toHaveBeenCalled()
    })

    it('無 Holding 時以自選股每檔 1 股回退', async () => {
      prisma.holding.findMany.mockResolvedValue([])
      prisma.watchlistItem.findMany.mockResolvedValue([{ stockCode: '0050' }])

      const result = await svc.getUserCodesWithShares('user-1')

      expect(result).toEqual([{ code: '0050', shares: 1 }])
    })
  })

  describe('getSectorDistribution()', () => {
    it('無任何持股或自選股時回傳空結果', async () => {
      const result = await svc.getSectorDistribution('user-1')

      expect(result).toEqual({ totalValue: 0, sectors: [] })
    })

    it('依市值權重計算產業分布', async () => {
      prisma.holding.findMany.mockResolvedValue([{ stockCode: '2330', shares: 10 }])
      prisma.stock.findMany.mockResolvedValue([{ code: '2330', sector: '半導體', name: '台積電' }])
      prisma.stockPrice.findMany.mockResolvedValue([{ stockCode: '2330', close: 100 }])

      const result = await svc.getSectorDistribution('user-1')

      expect(result.totalValue).toBe(1000)
      expect(result.sectors).toEqual([{ sector: '半導體', value: 1000, pct: 100 }])
    })
  })

  describe('getMonthlyIncome()', () => {
    it('無持股與自選股時回傳全零月份', async () => {
      const result = await svc.getMonthlyIncome('user-1', 2025)

      expect(result.annualIncome).toBe(0)
      expect(result.months).toHaveLength(12)
      expect(result.months.every((m) => m.income === 0)).toBe(true)
    })

    it('依 payDate 所在月份彙總收入', async () => {
      prisma.holding.findMany.mockResolvedValue([{ stockCode: '2330', shares: 10 }])
      prisma.dividend.findMany.mockResolvedValue([
        { stockCode: '2330', payDate: new Date(2025, 2, 15), cash: 5 },
      ])

      const result = await svc.getMonthlyIncome('user-1', 2025)

      expect(result.months[2].income).toBe(50)
      expect(result.annualIncome).toBe(50)
    })
  })

  describe('getHeatmap()', () => {
    it('無持股與自選股時回傳空產業列', async () => {
      const result = await svc.getHeatmap('user-1', 2025)

      expect(result).toEqual({ year: 2025, sectors: [] })
    })
  })

  describe('getAnnualGrowth()', () => {
    it('無持股與自選股時回傳每年皆為零的結構', async () => {
      const result = await svc.getAnnualGrowth('user-1', 3)

      expect(result.years).toHaveLength(3)
      expect(result.years.every((y) => y.total === 0)).toBe(true)
    })
  })
})
