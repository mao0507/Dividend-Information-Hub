import { BadRequestException, NotFoundException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { PrismaService } from '../prisma/prisma.service'
import { HoldingsService } from './holdings.service'

const makeLot = (overrides: Partial<{
  id: string
  stockCode: string
  buyTimestamp: Date
  buyPrice: number
  buyQuantity: number
}> = {}) => ({
  id: 'lot-1',
  stockCode: '2330',
  buyTimestamp: new Date('2024-01-01T00:00:00Z'),
  buyPrice: 600,
  buyQuantity: 1000,
  ...overrides,
})

describe('HoldingsService', () => {
  let svc: HoldingsService
  let prisma: {
    stock: { count: jest.Mock }
    holdingLot: {
      create: jest.Mock
      findFirst: jest.Mock
      findMany: jest.Mock
      delete: jest.Mock
    }
    holding: {
      findMany: jest.Mock
      deleteMany: jest.Mock
      upsert: jest.Mock
    }
    dividend: { findMany: jest.Mock }
    stockPrice: { findMany: jest.Mock }
    $transaction: jest.Mock
  }

  beforeEach(async () => {
    prisma = {
      stock: { count: jest.fn().mockResolvedValue(1) },
      holdingLot: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
        delete: jest.fn(),
      },
      holding: {
        findMany: jest.fn().mockResolvedValue([]),
        deleteMany: jest.fn(),
        upsert: jest.fn(),
      },
      dividend: { findMany: jest.fn().mockResolvedValue([]) },
      stockPrice: { findMany: jest.fn().mockResolvedValue([]) },
      $transaction: jest.fn((cb: (tx: unknown) => unknown) => cb(prisma)),
    }

    const mod = await Test.createTestingModule({
      providers: [
        HoldingsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile()

    svc = mod.get(HoldingsService)
  })

  afterEach(() => jest.clearAllMocks())

  // ─── createLot ────────────────────────────────────────────────────────────

  describe('createLot()', () => {
    it('股票不存在時拋出 BadRequestException', async () => {
      prisma.stock.count.mockResolvedValue(0)
      await expect(svc.createLot('user-1', {
        stockCode: 'XXXX',
        buyTimestamp: new Date(),
        buyPrice: 100,
        buyQuantity: 100,
      })).rejects.toBeInstanceOf(BadRequestException)
    })

    it('建立 lot 後呼叫 recalculateHolding', async () => {
      const lot = makeLot()
      prisma.holdingLot.create.mockResolvedValue(lot)
      prisma.holdingLot.findMany.mockResolvedValue([lot])

      await svc.createLot('user-1', {
        stockCode: lot.stockCode,
        buyTimestamp: lot.buyTimestamp,
        buyPrice: lot.buyPrice,
        buyQuantity: lot.buyQuantity,
      })

      expect(prisma.holdingLot.create).toHaveBeenCalledTimes(1)
      expect(prisma.holding.upsert).toHaveBeenCalledTimes(1)
    })
  })

  // ─── deleteLot ────────────────────────────────────────────────────────────

  describe('deleteLot()', () => {
    it('批次不存在時拋出 NotFoundException', async () => {
      prisma.holdingLot.findFirst.mockResolvedValue(null)
      await expect(svc.deleteLot('user-1', 'missing-id')).rejects.toBeInstanceOf(NotFoundException)
    })

    it('刪除批次後呼叫 recalculateHolding', async () => {
      const lot = makeLot()
      prisma.holdingLot.findFirst.mockResolvedValue(lot)
      prisma.holdingLot.findMany.mockResolvedValue([]) // 最後一筆

      await svc.deleteLot('user-1', lot.id)

      expect(prisma.holdingLot.delete).toHaveBeenCalledWith({ where: { id: lot.id } })
    })

    it('最後一筆刪除時刪除 Holding', async () => {
      const lot = makeLot()
      prisma.holdingLot.findFirst.mockResolvedValue(lot)
      prisma.holdingLot.findMany.mockResolvedValue([]) // 無剩餘

      await svc.deleteLot('user-1', lot.id)

      expect(prisma.holding.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', stockCode: lot.stockCode },
      })
      expect(prisma.holding.upsert).not.toHaveBeenCalled()
    })
  })

  // ─── recalculateHolding ───────────────────────────────────────────────────

  describe('recalculateHolding()', () => {
    it('無批次時刪除 Holding', async () => {
      prisma.holdingLot.findMany.mockResolvedValue([])

      await svc.recalculateHolding('user-1', '2330')

      expect(prisma.holding.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', stockCode: '2330' },
      })
    })

    it('加權均價計算正確', async () => {
      prisma.holdingLot.findMany.mockResolvedValue([
        makeLot({ buyPrice: 600, buyQuantity: 1000 }),
        makeLot({ id: 'lot-2', buyPrice: 500, buyQuantity: 500, buyTimestamp: new Date('2024-02-01T00:00:00Z') }),
      ])
      prisma.dividend.findMany.mockResolvedValue([])

      await svc.recalculateHolding('user-1', '2330')

      const upsertCall = prisma.holding.upsert.mock.calls[0][0]
      // avgCost = (600*1000 + 500*500) / 1500 = 850000/1500 ≈ 566.67
      expect(upsertCall.update.shares).toBe(1500)
      expect(upsertCall.update.avgCost).toBeCloseTo(566.67, 1)
    })

    it('earnedDividend 計算：payDate >= buyTimestamp 且 filled=true', async () => {
      const buyDate = new Date('2024-01-01T00:00:00Z')
      prisma.holdingLot.findMany.mockResolvedValue([
        makeLot({ buyTimestamp: buyDate, buyQuantity: 1000 }),
      ])
      prisma.dividend.findMany.mockResolvedValue([
        { cash: 2.5, payDate: new Date('2024-06-01T00:00:00Z') }, // 在買入後 → 計入
        { cash: 3.0, payDate: new Date('2023-12-01T00:00:00Z') }, // 在買入前 → 不計入
      ])

      await svc.recalculateHolding('user-1', '2330')

      const upsertCall = prisma.holding.upsert.mock.calls[0][0]
      expect(upsertCall.update.earnedDividend).toBeCloseTo(2500) // 2.5 * 1000
    })

    it('allocation 回傳正確 totalCost', async () => {
      prisma.holdingLot.findMany.mockResolvedValue([
        makeLot({ stockCode: '2330', buyPrice: 600, buyQuantity: 1000 }),
        makeLot({ id: 'lot-2', stockCode: '0050', buyPrice: 150, buyQuantity: 2000 }),
      ])
      prisma.stock.count.mockResolvedValue(1) // reuse mock for stock.findMany shorthand
      // Override stock.findMany mock
      ;(prisma as unknown as { stock: { findMany?: jest.Mock } }).stock.findMany = jest
        .fn()
        .mockResolvedValue([
          { code: '2330', name: '台積電' },
          { code: '0050', name: '元大台灣50' },
        ])

      const result = await svc.getAllocation('user-1')

      expect(result).toHaveLength(2)
      const tsmc = result.find((r) => r.stockCode === '2330')!
      expect(tsmc.totalCost).toBe(600000)
    })
  })

  // ─── getPnl ───────────────────────────────────────────────────────────────

  describe('getPnl()', () => {
    it('無持股時回傳空列表與全零總計', async () => {
      prisma.holdingLot.findMany.mockResolvedValue([])

      const result = await svc.getPnl('user-1')

      expect(result.holdings).toEqual([])
      expect(result.total).toEqual({
        totalCostBasis: 0,
        totalCurrentValue: 0,
        totalUnrealizedGain: 0,
        totalUnrealizedGainPct: 0,
      })
    })

    it('依最新收盤價計算單檔與總計未實現損益', async () => {
      prisma.holdingLot.findMany.mockResolvedValue([
        makeLot({ stockCode: '2330', buyPrice: 600, buyQuantity: 1000 }),
        makeLot({ id: 'lot-2', stockCode: '2330', buyPrice: 500, buyQuantity: 500, buyTimestamp: new Date('2024-02-01T00:00:00Z') }),
      ])
      prisma.stockPrice.findMany.mockResolvedValue([
        { stockCode: '2330', close: 700 },
      ])

      const result = await svc.getPnl('user-1')

      // costBasis = 600*1000 + 500*500 = 850000, currentValue = 700*1500 = 1050000
      expect(result.holdings).toHaveLength(1)
      const row = result.holdings[0]
      expect(row.stockCode).toBe('2330')
      expect(row.costBasis).toBe(850000)
      expect(row.currentValue).toBe(1050000)
      expect(row.unrealizedGain).toBe(200000)
      expect(row.unrealizedGainPct).toBeCloseTo(23.53, 1)
      expect(row.priceUnavailableReason).toBeNull()

      expect(result.total.totalCostBasis).toBe(850000)
      expect(result.total.totalCurrentValue).toBe(1050000)
      expect(result.total.totalUnrealizedGain).toBe(200000)
    })

    it('查無最新股價時該檔損益欄位為 null 並附原因，不計入總計市值', async () => {
      prisma.holdingLot.findMany.mockResolvedValue([
        makeLot({ stockCode: '9999', buyPrice: 100, buyQuantity: 100 }),
      ])
      prisma.stockPrice.findMany.mockResolvedValue([])

      const result = await svc.getPnl('user-1')

      const row = result.holdings[0]
      expect(row.currentValue).toBeNull()
      expect(row.unrealizedGain).toBeNull()
      expect(row.unrealizedGainPct).toBeNull()
      expect(row.priceUnavailableReason).toBe('priceUnavailable')

      // 無股價的持股成本不計入損益總計分母，避免被誤算成全額虧損
      expect(result.total.totalCostBasis).toBe(10000)
      expect(result.total.totalCurrentValue).toBe(0)
      expect(result.total.totalUnrealizedGain).toBe(0)
      expect(result.total.totalUnrealizedGainPct).toBe(0)
    })

    it('部分持股無股價時，總計損益只計入有股價的持股成本', async () => {
      prisma.holdingLot.findMany.mockResolvedValue([
        makeLot({ stockCode: '2330', buyPrice: 600, buyQuantity: 1000 }), // 有股價
        makeLot({ id: 'lot-2', stockCode: '9999', buyPrice: 100, buyQuantity: 100 }), // 無股價
      ])
      prisma.stockPrice.findMany.mockResolvedValue([
        { stockCode: '2330', close: 700 },
      ])

      const result = await svc.getPnl('user-1')

      // totalCostBasis 含全部持股成本，但損益分母只算有股價的 2330（600000）
      expect(result.total.totalCostBasis).toBe(600000 + 10000)
      expect(result.total.totalCurrentValue).toBe(700000)
      expect(result.total.totalUnrealizedGain).toBe(100000)
      expect(result.total.totalUnrealizedGainPct).toBeCloseTo((100000 / 600000) * 100, 1)
    })

    it('多檔持股各自計算並加總', async () => {
      prisma.holdingLot.findMany.mockResolvedValue([
        makeLot({ stockCode: '2330', buyPrice: 600, buyQuantity: 1000 }),
        makeLot({ id: 'lot-2', stockCode: '0050', buyPrice: 150, buyQuantity: 2000 }),
      ])
      prisma.stockPrice.findMany.mockResolvedValue([
        { stockCode: '2330', date: new Date('2024-06-01T00:00:00Z'), close: 700 },
        { stockCode: '0050', date: new Date('2024-06-01T00:00:00Z'), close: 140 },
      ])

      const result = await svc.getPnl('user-1')

      expect(result.holdings).toHaveLength(2)
      expect(result.total.totalCostBasis).toBe(600000 + 300000)
      expect(result.total.totalCurrentValue).toBe(700000 + 280000)
      expect(result.total.totalUnrealizedGain).toBe(700000 + 280000 - 900000)
    })
  })
})
