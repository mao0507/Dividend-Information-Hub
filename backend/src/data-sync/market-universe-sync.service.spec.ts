import { Test } from '@nestjs/testing';
import { MarketUniverseSyncService } from './market-universe-sync.service';
import { PrismaService } from '../prisma/prisma.service';
import * as seedUniverse from '../prisma-seed/twse-seed-universe';

jest.mock('../prisma-seed/twse-seed-universe');
const mockFetchTwse = seedUniverse.fetchTwseSeedUniverseOnline as jest.Mock;

const tpexRow = (code: string, name: string) => ({
  SecuritiesCompanyCode: code,
  CompanyName: name,
  Close: '100',
});

const mockFetch = (rows: object[]) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => rows,
  } as Response);
};

describe('MarketUniverseSyncService', () => {
  let svc: MarketUniverseSyncService;
  let prisma: {
    stock: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      stock: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
    };

    const mod = await Test.createTestingModule({
      providers: [
        MarketUniverseSyncService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    svc = mod.get(MarketUniverseSyncService);
  });

  afterEach(() => jest.clearAllMocks());

  it('新代號應 INSERT isActive=true', async () => {
    mockFetchTwse.mockResolvedValue({
      stocks: [
        {
          code: '2330',
          name: '台積電',
          sector: '半導體業',
          isEtf: false,
          nameAlias: null,
          pe: null,
          marketCap: null,
        },
      ],
      referenceDayYmd: '20260428',
    });
    mockFetch([tpexRow('3037', '欣興')]);
    prisma.stock.findUnique.mockResolvedValue(null);

    const result = await svc.refresh();

    expect(prisma.stock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ code: '2330', market: 'TWSE', isActive: true }),
      }),
    );
    expect(prisma.stock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ code: '3037', market: 'TPEX', isActive: true }),
      }),
    );
    expect(result.twseAdded).toBe(1);
    expect(result.tpexAdded).toBe(1);
  });

  it('已下市代號應設 isActive=false 而非刪除', async () => {
    mockFetchTwse.mockResolvedValue({ stocks: [], referenceDayYmd: '20260428' });
    mockFetch([]);
    prisma.stock.updateMany.mockResolvedValue({ count: 5 });

    const result = await svc.refresh();

    expect(prisma.stock.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isActive: true }),
        data: { isActive: false },
      }),
    );
    expect(result.deactivated).toBe(5);
  });

  it('名稱更新時應 UPDATE name', async () => {
    mockFetchTwse.mockResolvedValue({
      stocks: [
        {
          code: '2330',
          name: '台積電新名',
          sector: '半導體業',
          isEtf: false,
          nameAlias: null,
          pe: null,
          marketCap: null,
        },
      ],
      referenceDayYmd: '20260428',
    });
    mockFetch([]);
    prisma.stock.findUnique.mockResolvedValue({ name: '台積電舊名', isActive: true });

    await svc.refresh();

    expect(prisma.stock.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { code: '2330' },
        data: expect.objectContaining({ name: '台積電新名' }),
      }),
    );
  });

  it('TWSE API 失敗時應 throw 並不寫入任何資料', async () => {
    mockFetchTwse.mockRejectedValue(new Error('TWSE API error'));
    mockFetch([tpexRow('3037', '欣興')]);

    await expect(svc.refresh()).rejects.toThrow('TWSE API error');
    expect(prisma.stock.create).not.toHaveBeenCalled();
    expect(prisma.stock.updateMany).not.toHaveBeenCalled();
  });
});
