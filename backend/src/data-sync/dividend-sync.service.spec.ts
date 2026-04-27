import { DividendSyncService } from './dividend-sync.service'

const mockPrisma = {
  stock: { findMany: jest.fn() },
  dividend: {
    findFirst: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  },
} as any

const mockConfig = { get: jest.fn() } as any

describe('DividendSyncService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
    mockConfig.get.mockReturnValue(undefined) // no FINMIND_TOKEN → TWSE only
  })

  const makeService = () => new DividendSyncService(mockPrisma, mockConfig)

  const twseRow = (code: string, rocDate: string, amount: string, type: string) =>
    [rocDate, code, `股票${code}`, '100', '98', amount, type, '', '', '', '', '', '', '', '']

  const mockTwseOk = (rows: string[][]) =>
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ stat: 'OK', data: rows }),
    })

  describe('upsertRecords', () => {
    it('creates new dividend when no existing record found', async () => {
      mockPrisma.dividend.findFirst
        .mockResolvedValueOnce(null)  // existing check
        .mockResolvedValueOnce(null)  // maxPeriod check
      mockPrisma.dividend.create.mockResolvedValue({})

      const result = await makeService().upsertRecords([
        { stockCode: '2330', year: 2026, cash: 3.0, exDate: new Date('2026-04-24'), freq: 'annual' },
      ])

      expect(result).toBe(1)
      expect(mockPrisma.dividend.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ stockCode: '2330', cash: 3.0, year: 2026, period: 1 }),
        }),
      )
    })

    it('updates existing record when found by exDate proximity', async () => {
      mockPrisma.dividend.findFirst.mockResolvedValue({ id: 'div-1', filled: false, fillDays: null })
      mockPrisma.dividend.update.mockResolvedValue({})

      await makeService().upsertRecords([
        { stockCode: '2330', year: 2026, cash: 3.0, exDate: new Date('2026-04-24') },
      ])

      expect(mockPrisma.dividend.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'div-1' } }),
      )
      expect(mockPrisma.dividend.create).not.toHaveBeenCalled()
    })

    it('skips records without exDate', async () => {
      const result = await makeService().upsertRecords([
        { stockCode: '2330', year: 2026, cash: 3.0, exDate: null },
      ])
      expect(result).toBe(0)
      expect(mockPrisma.dividend.findFirst).not.toHaveBeenCalled()
    })
  })

  describe('syncAll — TWSE source (no token)', () => {
    it('syncs and returns upserted count', async () => {
      mockPrisma.stock.findMany.mockResolvedValue([{ code: '2330' }])
      mockPrisma.dividend.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
      mockPrisma.dividend.create.mockResolvedValue({})
      mockTwseOk([twseRow('2330', '115年04月24日', '3.000000', '息')])

      const { total, failed } = await makeService().syncAll()
      expect(total).toBe(1)
      expect(failed).toHaveLength(0)
    })

    it('skips rows with 權 type', async () => {
      mockPrisma.stock.findMany.mockResolvedValue([{ code: '2330' }])
      mockTwseOk([twseRow('2330', '115年04月24日', '0.500000', '權')])

      const { total } = await makeService().syncAll()
      expect(total).toBe(0)
    })

    it('skips untracked stock codes', async () => {
      mockPrisma.stock.findMany.mockResolvedValue([{ code: '0050' }])
      mockTwseOk([twseRow('9999', '115年04月24日', '1.000000', '息')])

      const { total } = await makeService().syncAll()
      expect(total).toBe(0)
    })

    it('returns failed list when TWSE fetch fails', async () => {
      mockPrisma.stock.findMany.mockResolvedValue([])
      ;(global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 503 })

      const { total, failed } = await makeService().syncAll()
      expect(total).toBe(0)
      expect(failed).toContain('TWSE_TWT49U')
    })
  })

  describe('syncAll — FinMind source with fallback', () => {
    it('falls back to TWSE when FinMind throws', async () => {
      mockConfig.get.mockReturnValue('fake-token')
      mockPrisma.stock.findMany.mockResolvedValue([{ code: '2330' }])
      mockPrisma.dividend.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
      mockPrisma.dividend.create.mockResolvedValue({})

      // first call → FinMind (fails), second call → TWSE (ok)
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: true, json: async () => ({ status: 402, msg: 'Please upgrade', data: [] }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ stat: 'OK', data: [twseRow('2330', '115年04月24日', '3.000000', '息')] }) })

      const { total, failed } = await makeService().syncAll()
      expect(total).toBe(1)
      expect(failed).toContain('FinMind_TaiwanStockDividend')
    })
  })
})
