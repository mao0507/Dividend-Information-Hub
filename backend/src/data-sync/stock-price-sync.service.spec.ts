import {
  parseTwseMiIndexQuotes,
  StockPriceSyncService,
} from './stock-price-sync.service';

const mockPrisma = {
  stock: { findMany: jest.fn() },
  stockPrice: { upsert: jest.fn(), deleteMany: jest.fn() },
} as any;

const makeMiResponse = (data: string[][]) => ({
  stat: 'OK',
  tables: [
    {
      fields: [
        '證券代號',
        '證券名稱',
        '成交股數',
        '成交筆數',
        '成交金額',
        '開盤價',
        '最高價',
        '最低價',
        '收盤價',
      ],
      data,
    },
  ],
});

describe('parseTwseMiIndexQuotes', () => {
  it('parses MI_INDEX table by field names', () => {
    const out = parseTwseMiIndexQuotes(
      makeMiResponse([
        [
          '2330',
          '台積電',
          '1,000',
          '10',
          '2,000,000',
          '2000',
          '2050',
          '1990',
          '2040',
        ],
      ]) as any,
    );
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      code: '2330',
      open: 2000,
      high: 2050,
      low: 1990,
      close: 2040,
    });
  });
});

describe('StockPriceSyncService', () => {
  const service = new StockPriceSyncService(mockPrisma);

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('syncDate', () => {
    it('returns 0 and logs skip on non-trading day (empty data)', async () => {
      mockPrisma.stockPrice.deleteMany.mockResolvedValue({ count: 3 });
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ stat: 'OK', tables: [] }),
      });

      const result = await service.syncDate(new Date('2024-01-01'));
      expect(result).toBe(0);
      expect(mockPrisma.stockPrice.upsert).not.toHaveBeenCalled();
      expect(mockPrisma.stockPrice.deleteMany).toHaveBeenCalledTimes(1);
    });

    it('upserts only tracked stock codes', async () => {
      mockPrisma.stock.findMany.mockResolvedValue([
        { code: '2330' },
        { code: '0050' },
      ]);
      mockPrisma.stockPrice.upsert.mockResolvedValue({});

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () =>
          makeMiResponse([
            [
              '2330',
              '台積電',
              '1,000,000',
              '10',
              '200,000,000',
              '750',
              '760',
              '745',
              '755',
            ],
            ['9999', '未追蹤股', '100', '1', '1,000', '10', '11', '9', '10'],
            [
              '0050',
              '元大台灣50',
              '500,000',
              '20',
              '85,000,000',
              '169',
              '170',
              '168',
              '169.5',
            ],
          ]),
      });

      const result = await service.syncDate(new Date('2024-04-15'));
      expect(result).toBe(2);
      expect(mockPrisma.stockPrice.upsert).toHaveBeenCalledTimes(2);
      const firstCall = mockPrisma.stockPrice.upsert.mock.calls[0][0];
      expect(firstCall.where.stockCode_date.stockCode).toBe('2330');
      expect(firstCall.create.close).toBe(755);
      expect(firstCall.create.open).toBe(750);
      expect(firstCall.create.high).toBe(760);
      expect(firstCall.create.low).toBe(745);
    });

    it('skips rows with close price = 0', async () => {
      mockPrisma.stock.findMany.mockResolvedValue([{ code: '2330' }]);
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () =>
          makeMiResponse([
            ['2330', '台積電', '0', '0', '0', '--', '--', '--', '--'],
          ]),
      });

      const result = await service.syncDate(new Date('2024-04-15'));
      expect(result).toBe(0);
      expect(mockPrisma.stockPrice.upsert).not.toHaveBeenCalled();
    });

    it('does not throw when volume is non-numeric', async () => {
      mockPrisma.stock.findMany.mockResolvedValue([{ code: '2330' }]);
      mockPrisma.stockPrice.upsert.mockResolvedValue({});
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () =>
          makeMiResponse([
            ['2330', '台積電', '--', '1', '1', '2000', '2010', '1990', '2005'],
          ]),
      });

      const result = await service.syncDate(new Date('2024-04-15'));
      expect(result).toBe(1);
      const firstCall = mockPrisma.stockPrice.upsert.mock.calls[0][0];
      expect(firstCall.create.volume).toBe(0n);
    });

    it('retries then throws when TWSE API repeatedly returns non-ok status', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 503 });
      await expect(service.syncDate(new Date('2024-06-01'))).rejects.toThrow(
        'TWSE API error: 503',
      );
      expect(global.fetch).toHaveBeenCalledTimes(3);
    }, 15000);
  });
});
