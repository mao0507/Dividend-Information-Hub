import { Test } from '@nestjs/testing'
import { CalendarService } from './calendar.service'
import { PrismaService } from '../prisma/prisma.service'

describe('CalendarService', () => {
  let svc: CalendarService
  let prisma: {
    watchlistItem: { findMany: jest.Mock }
    dividend: { findMany: jest.Mock }
  }

  beforeEach(async () => {
    prisma = {
      watchlistItem: { findMany: jest.fn().mockResolvedValue([]) },
      dividend: { findMany: jest.fn().mockResolvedValue([]) },
    }

    const mod = await Test.createTestingModule({
      providers: [CalendarService, { provide: PrismaService, useValue: prisma }],
    }).compile()

    svc = mod.get(CalendarService)
  })

  afterEach(() => jest.clearAllMocks())

  describe('getMonthEvents()', () => {
    it('查無資料時回傳空陣列', async () => {
      const result = await svc.getMonthEvents(2025, 3, 'user-1')

      expect(result).toEqual([])
    })

    it('回傳事件並正確標記是否為自選股', async () => {
      prisma.watchlistItem.findMany.mockResolvedValue([{ stockCode: '2330' }])
      prisma.dividend.findMany.mockResolvedValue([
        {
          id: 'div-1',
          stockCode: '2330',
          cash: 2.5,
          freq: 'annual',
          exDate: new Date(2025, 2, 15),
          payDate: new Date(2025, 3, 15),
          stock: { name: '台積電', prices: [{ close: 600 }] },
        },
      ])

      const result = await svc.getMonthEvents(2025, 3, 'user-1')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        stockCode: '2330',
        stockName: '台積電',
        amount: 2.5,
        isWatchlist: true,
      })
    })

    it('watchlistOnly 篩選時應限制查詢為自選股代碼', async () => {
      prisma.watchlistItem.findMany.mockResolvedValue([{ stockCode: '2330' }])

      await svc.getMonthEvents(2025, 3, 'user-1', { watchlistOnly: true })

      expect(prisma.dividend.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ stockCode: { in: ['2330'] } }),
        }),
      )
    })

    it('yieldGt 篩選應排除殖利率不足的事件', async () => {
      prisma.dividend.findMany.mockResolvedValue([
        {
          id: 'div-1',
          stockCode: '2330',
          cash: 1,
          freq: 'annual',
          exDate: new Date(2025, 2, 15),
          payDate: null,
          stock: { name: '台積電', prices: [{ close: 1000 }] },
        },
      ])

      const result = await svc.getMonthEvents(2025, 3, 'user-1', { yieldGt: 5 })

      expect(result).toEqual([])
    })
  })

  describe('getUpcoming()', () => {
    it('查無資料時回傳空陣列', async () => {
      const result = await svc.getUpcoming(30, 'user-1')

      expect(result).toEqual([])
    })

    it('回傳即將除息事件並標記自選股', async () => {
      prisma.watchlistItem.findMany.mockResolvedValue([{ stockCode: '0050' }])
      prisma.dividend.findMany.mockResolvedValue([
        {
          exDate: new Date(),
          stockCode: '0050',
          cash: 1.2,
          freq: 'quarterly',
          stock: { name: '元大台灣50' },
        },
      ])

      const result = await svc.getUpcoming(30, 'user-1')

      expect(result).toEqual([
        {
          date: expect.any(Date),
          stockCode: '0050',
          stockName: '元大台灣50',
          amount: 1.2,
          freq: 'quarterly',
          type: 'exDiv',
          isWatchlist: true,
        },
      ])
    })
  })
})
