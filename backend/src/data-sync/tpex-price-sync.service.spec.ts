import { Test } from '@nestjs/testing';
import { TpexPriceSyncService } from './tpex-price-sync.service';
import { PrismaService } from '../prisma/prisma.service';

const makeRow = (code: string, close: string, date = '20260425') => ({
  Date: date,
  SecuritiesCompanyCode: code,
  CompanyName: '測試公司',
  Close: close,
  Open: close,
  High: close,
  Low: close,
  Change: '0',
  TradingShares: '1000000',
});

const mockFetch = (rows: object[], ok = true) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 503,
    json: async () => rows,
  } as unknown as Response);
};

describe('TpexPriceSyncService', () => {
  let svc: TpexPriceSyncService;
  let prisma: {
    stock: { findMany: jest.Mock };
    stockPrice: { upsert: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      stock: {
        findMany: jest.fn().mockResolvedValue([{ code: '3037' }]),
      },
      stockPrice: { upsert: jest.fn() },
    };

    const mod = await Test.createTestingModule({
      providers: [
        TpexPriceSyncService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    svc = mod.get(TpexPriceSyncService);
  });

  afterEach(() => jest.clearAllMocks());

  it('成功寫入上櫃股票收盤價', async () => {
    mockFetch([makeRow('3037', '285.5')]);
    const count = await svc.syncDate(new Date());
    expect(prisma.stockPrice.upsert).toHaveBeenCalledTimes(1);
    expect(count).toBe(1);
  });

  it('非追蹤代號應跳過', async () => {
    mockFetch([makeRow('9999', '100')]);
    const count = await svc.syncDate(new Date());
    expect(prisma.stockPrice.upsert).not.toHaveBeenCalled();
    expect(count).toBe(0);
  });

  it('空資料（非交易日）應回傳 0 不拋錯', async () => {
    mockFetch([]);
    const count = await svc.syncDate(new Date());
    expect(count).toBe(0);
    expect(prisma.stockPrice.upsert).not.toHaveBeenCalled();
  });

  it('收盤價格無效的列應跳過，不中斷整批', async () => {
    mockFetch([makeRow('3037', '--'), makeRow('3037', '285.5')]);
    prisma.stock.findMany.mockResolvedValue([{ code: '3037' }]);
    const count = await svc.syncDate(new Date());
    expect(count).toBe(1);
  });
});
