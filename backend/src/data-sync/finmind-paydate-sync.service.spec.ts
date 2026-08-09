import { Test } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { FinMindPayDateSyncService } from './finmind-paydate-sync.service'
import { PrismaService } from '../prisma/prisma.service'

const makeDividendRow = (overrides: Partial<{ stockCode: string }> = {}) => ({
  stockCode: '2330',
  ...overrides,
})

describe('FinMindPayDateSyncService', () => {
  let svc: FinMindPayDateSyncService
  let prisma: {
    dividend: {
      findMany: jest.Mock
      findFirst: jest.Mock
      update: jest.Mock
    }
  }
  let config: { get: jest.Mock }
  let fetchMock: jest.Mock

  beforeEach(async () => {
    prisma = {
      dividend: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn().mockResolvedValue(null),
        update: jest.fn().mockResolvedValue({}),
      },
    }
    config = { get: jest.fn().mockReturnValue('test-token') }
    fetchMock = jest.fn()
    global.fetch = fetchMock as unknown as typeof fetch

    const mod = await Test.createTestingModule({
      providers: [
        FinMindPayDateSyncService,
        { provide: PrismaService, useValue: prisma },
        { provide: ConfigService, useValue: config },
      ],
    }).compile()

    svc = mod.get(FinMindPayDateSyncService)
  })

  afterEach(() => jest.clearAllMocks())

  it('FINMIND_TOKEN 未設定時應拋出錯誤', async () => {
    config.get.mockReturnValue(undefined)

    await expect(svc.syncPayDates()).rejects.toThrow('FINMIND_TOKEN not configured')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('無待補 payDate 的股票時應回傳全零結果，且不呼叫 fetch', async () => {
    prisma.dividend.findMany.mockResolvedValue([])

    const result = await svc.syncPayDates()

    expect(result).toEqual({ fetched: 0, updated: 0, rateLimited: false })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('遇到 402 rate limit 時應中止並回傳 rateLimited=true', async () => {
    prisma.dividend.findMany.mockResolvedValue([
      makeDividendRow({ stockCode: '2330' }),
      makeDividendRow({ stockCode: '2317' }),
    ])
    fetchMock.mockResolvedValue({
      json: async () => ({ status: 402, msg: 'rate limit' }),
    })

    const result = await svc.syncPayDates()

    expect(result.rateLimited).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('找到對應 exDate 視窗內的 payDate=null 記錄時應更新並累計 updated', async () => {
    prisma.dividend.findMany.mockResolvedValue([makeDividendRow()])
    fetchMock.mockResolvedValue({
      json: async () => ({
        status: 200,
        msg: 'success',
        data: [
          {
            stock_id: '2330',
            CashExDividendTradingDate: '2024-06-13',
            CashDividendPaymentDate: '2024-07-18',
            CashEarningsDistribution: 2.5,
          },
        ],
      }),
    })
    prisma.dividend.findFirst.mockResolvedValue({ id: 'div-1' })

    const result = await svc.syncPayDates()

    expect(result.fetched).toBe(1)
    expect(result.updated).toBe(1)
    expect(prisma.dividend.update).toHaveBeenCalledWith({
      where: { id: 'div-1' },
      data: { payDate: new Date('2024-07-18') },
    })
  })

  it('payDate 或 exDate 為 "0" 時應略過該筆，不查詢也不更新', async () => {
    prisma.dividend.findMany.mockResolvedValue([makeDividendRow()])
    fetchMock.mockResolvedValue({
      json: async () => ({
        status: 200,
        msg: 'success',
        data: [
          {
            stock_id: '2330',
            CashExDividendTradingDate: '0',
            CashDividendPaymentDate: '0',
            CashEarningsDistribution: 0,
          },
        ],
      }),
    })

    const result = await svc.syncPayDates()

    expect(result.updated).toBe(0)
    expect(prisma.dividend.findFirst).not.toHaveBeenCalled()
  })

  it('找不到對應 Dividend 記錄時 updated 應維持 0', async () => {
    prisma.dividend.findMany.mockResolvedValue([makeDividendRow()])
    fetchMock.mockResolvedValue({
      json: async () => ({
        status: 200,
        msg: 'success',
        data: [
          {
            stock_id: '2330',
            CashExDividendTradingDate: '2024-06-13',
            CashDividendPaymentDate: '2024-07-18',
            CashEarningsDistribution: 2.5,
          },
        ],
      }),
    })
    prisma.dividend.findFirst.mockResolvedValue(null)

    const result = await svc.syncPayDates()

    expect(result.updated).toBe(0)
    expect(prisma.dividend.update).not.toHaveBeenCalled()
  })

  it('單一股票網路錯誤時應記錄並繼續處理下一檔，不中斷整體流程', async () => {
    prisma.dividend.findMany.mockResolvedValue([
      makeDividendRow({ stockCode: '2330' }),
      makeDividendRow({ stockCode: '2317' }),
    ])
    fetchMock
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce({
        json: async () => ({ status: 200, msg: 'success', data: [] }),
      })

    const result = await svc.syncPayDates()

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(result.rateLimited).toBe(false)
  })
})
