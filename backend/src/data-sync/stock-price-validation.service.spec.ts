import { StockPriceValidationService } from './stock-price-validation.service';

const mockPrisma = {
  stockPrice: { findUnique: jest.fn() },
} as any;

const mockPriceSync = {
  fetchTwseMiIndexWithRetry: jest.fn(),
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

describe('StockPriceValidationService', () => {
  const service = new StockPriceValidationService(mockPrisma, mockPriceSync);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns NOT_TRADING_DAY when twse has no rows', async () => {
    mockPriceSync.fetchTwseMiIndexWithRetry.mockResolvedValue({
      stat: 'OK',
      tables: [],
    });
    const r = await service.validateOne('2330', '2026-04-26');
    expect(r.status).toBe('NOT_TRADING_DAY');
  });

  it('returns MATCH when db close equals source close', async () => {
    mockPriceSync.fetchTwseMiIndexWithRetry.mockResolvedValue(
      makeMiResponse([
        ['2330', '台積電', '1', '1', '1', '2000', '2010', '1990', '2005'],
      ]),
    );
    mockPrisma.stockPrice.findUnique.mockResolvedValue({ close: 2005 });

    const r = await service.validateOne('2330', '2026-04-24');
    expect(r.status).toBe('MATCH');
    expect(r.dbClose).toBe(2005);
    expect(r.sourceClose).toBe(2005);
  });

  it('returns MISSING_IN_DB when source exists but db row missing', async () => {
    mockPriceSync.fetchTwseMiIndexWithRetry.mockResolvedValue(
      makeMiResponse([
        ['2330', '台積電', '1', '1', '1', '2000', '2010', '1990', '2005'],
      ]),
    );
    mockPrisma.stockPrice.findUnique.mockResolvedValue(null);

    const r = await service.validateOne('2330', '2026-04-24');
    expect(r.status).toBe('MISSING_IN_DB');
    expect(r.sourceClose).toBe(2005);
  });

  it('returns VALUE_MISMATCH when db close differs from source', async () => {
    mockPriceSync.fetchTwseMiIndexWithRetry.mockResolvedValue(
      makeMiResponse([
        ['2330', '台積電', '1', '1', '1', '2000', '2010', '1990', '2005'],
      ]),
    );
    mockPrisma.stockPrice.findUnique.mockResolvedValue({ close: 1005 });

    const r = await service.validateOne('2330', '2026-04-24');
    expect(r.status).toBe('VALUE_MISMATCH');
  });

  it('returns MISSING_IN_SOURCE when code absent in source rows', async () => {
    mockPriceSync.fetchTwseMiIndexWithRetry.mockResolvedValue(
      makeMiResponse([
        ['1101', '台泥', '1', '1', '1', '30', '31', '29', '30.5'],
      ]),
    );
    const r = await service.validateOne('2330', '2026-04-24');
    expect(r.status).toBe('MISSING_IN_SOURCE');
  });

  it('returns PARSE_ERROR when source close is non-numeric', async () => {
    mockPriceSync.fetchTwseMiIndexWithRetry.mockResolvedValue(
      makeMiResponse([
        ['2330', '台積電', '1', '1', '1', '2000', '2010', '1990', '--'],
      ]),
    );
    const r = await service.validateOne('2330', '2026-04-24');
    expect(r.status).toBe('PARSE_ERROR');
  });
});
