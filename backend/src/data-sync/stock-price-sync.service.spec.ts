import { StockPriceSyncService } from './stock-price-sync.service'

const mockPrisma = {
  stock: { findMany: jest.fn() },
  stockPrice: { upsert: jest.fn() },
} as any

describe('StockPriceSyncService', () => {
  const service = new StockPriceSyncService(mockPrisma)

  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('syncDate', () => {
    it('returns 0 and logs skip on non-trading day (empty data)', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ stat: 'OK', data: [] }),
      })

      const result = await service.syncDate(new Date('2024-01-01'))
      expect(result).toBe(0)
      expect(mockPrisma.stockPrice.upsert).not.toHaveBeenCalled()
    })

    it('returns 0 when stat is not OK', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ stat: 'NO DATA', data: [] }),
      })

      const result = await service.syncDate(new Date('2024-01-01'))
      expect(result).toBe(0)
    })

    it('upserts only tracked stock codes', async () => {
      mockPrisma.stock.findMany.mockResolvedValue([{ code: '2330' }, { code: '0050' }])
      mockPrisma.stockPrice.upsert.mockResolvedValue({})

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          stat: 'OK',
          data: [
            // tracked
            ['2330', '台積電', '1,000,000', '5,000', '200,000,000', '750', '760', '745', '755', '+', '5', '', '', '', '', ''],
            // not tracked
            ['9999', '未追蹤股', '100', '10', '1000', '10', '11', '9', '10', '+', '1', '', '', '', '', ''],
            // tracked
            ['0050', '元大台灣50', '500,000', '3,000', '85,000,000', '169', '170', '168', '169.5', '+', '0.5', '', '', '', '', ''],
          ],
        }),
      })

      const result = await service.syncDate(new Date('2024-04-15'))
      expect(result).toBe(2)
      expect(mockPrisma.stockPrice.upsert).toHaveBeenCalledTimes(2)
      const firstCall = mockPrisma.stockPrice.upsert.mock.calls[0][0]
      expect(firstCall.where.stockCode_date.stockCode).toBe('2330')
      expect(firstCall.create.close).toBe(755)
    })

    it('skips rows with close price = 0', async () => {
      mockPrisma.stock.findMany.mockResolvedValue([{ code: '2330' }])

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          stat: 'OK',
          data: [
            ['2330', '台積電', '0', '0', '0', '--', '--', '--', '--', '', '', '', '', '', '', ''],
          ],
        }),
      })

      const result = await service.syncDate(new Date('2024-04-15'))
      expect(result).toBe(0)
      expect(mockPrisma.stockPrice.upsert).not.toHaveBeenCalled()
    })

    it('throws when TWSE API returns non-ok status', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 503 })
      await expect(service.syncDate(new Date())).rejects.toThrow('TWSE API error: 503')
    })
  })
})
