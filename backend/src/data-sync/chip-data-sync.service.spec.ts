import { Test } from '@nestjs/testing';
import { ChipDataSyncService, parseShareholdingDistributionCsv } from './chip-data-sync.service';
import { PrismaService } from '../prisma/prisma.service';

const CSV_HEADER = '資料日期,證券代號,持股分級,人數,股數,占集保庫存數比例%';

const mockFetchCsv = (csv: string, ok = true) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 500,
    text: async () => csv,
  } as Response);
};

describe('parseShareholdingDistributionCsv', () => {
  it('解析合法列為型別化資料', () => {
    const csv = [
      CSV_HEADER,
      '20260807,2330,10,1,422278902,50.00',
    ].join('\n');

    const { rows, malformed } = parseShareholdingDistributionCsv(csv);

    expect(rows).toHaveLength(1);
    expect(malformed).toBe(0);
    expect(rows[0]).toEqual({
      date: new Date(Date.UTC(2026, 7, 7)),
      stockCode: '2330',
      tier: 10,
      holderCount: 1,
      shareCount: 422278902n,
      percentage: 50,
    });
  });

  it('跳過格式不符的列並計入 malformed', () => {
    const csv = [
      CSV_HEADER,
      '20260807,2330,10,1,422278902,50.00',
      'bad,row,here',
      ',,,,,',
    ].join('\n');

    const { rows, malformed } = parseShareholdingDistributionCsv(csv);

    expect(rows).toHaveLength(1);
    expect(malformed).toBe(2);
  });

  it('過濾合計／差異數調整列（tier > 15），不計入 malformed', () => {
    const csv = [
      CSV_HEADER,
      '20260807,2330,10,1,422278902,50.00',
      '20260807,2330,17,1,844557804,100.00',
    ].join('\n');

    const { rows, malformed } = parseShareholdingDistributionCsv(csv);

    expect(rows).toHaveLength(1);
    expect(malformed).toBe(0);
  });

  it('只有表頭時回傳空結果', () => {
    expect(parseShareholdingDistributionCsv(CSV_HEADER)).toEqual({ rows: [], malformed: 0 });
  });
});

describe('ChipDataSyncService', () => {
  let svc: ChipDataSyncService;
  let prisma: {
    stock: { findMany: jest.Mock };
    shareholdingDistribution: {
      upsert: jest.Mock;
      findFirst: jest.Mock;
      findMany: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      stock: { findMany: jest.fn().mockResolvedValue([]) },
      shareholdingDistribution: {
        upsert: jest.fn().mockResolvedValue({}),
        findFirst: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
      },
      $transaction: jest.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
    };

    const mod = await Test.createTestingModule({
      providers: [ChipDataSyncService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    svc = mod.get(ChipDataSyncService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('refresh()', () => {
    it('只 upsert 已追蹤的股票代號，其餘列計入 skipped', async () => {
      mockFetchCsv(
        [
          CSV_HEADER,
          '20260807,2330,15,1,422278902,100.00',
          '20260807,9999,15,1,100,100.00',
        ].join('\n'),
      );
      prisma.stock.findMany.mockResolvedValue([{ code: '2330' }]);

      const result = await svc.refresh();

      expect(prisma.shareholdingDistribution.upsert).toHaveBeenCalledTimes(1);
      expect(prisma.shareholdingDistribution.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { stockCode_date_tier: { stockCode: '2330', date: expect.any(Date), tier: 15 } },
        }),
      );
      expect(result.rowsUpserted).toBe(1);
      expect(result.skipped).toBe(1);
    });

    it('無資料時回傳 0 筆且不查詢股票清單', async () => {
      mockFetchCsv(CSV_HEADER);

      const result = await svc.refresh();

      expect(result.rowsUpserted).toBe(0);
      expect(prisma.stock.findMany).not.toHaveBeenCalled();
    });

    it('HTTP 失敗時 throw 並不寫入任何資料', async () => {
      mockFetchCsv('', false);

      await expect(svc.refresh()).rejects.toThrow('HTTP 500');
      expect(prisma.shareholdingDistribution.upsert).not.toHaveBeenCalled();
    });
  });

  describe('getLatestDistribution()', () => {
    it('查無資料時回傳 null', async () => {
      prisma.shareholdingDistribution.findFirst.mockResolvedValue(null);

      const result = await svc.getLatestDistribution('9999');

      expect(result).toBeNull();
    });

    it('回傳最新日期各級距資料', async () => {
      const date = new Date(Date.UTC(2026, 7, 7));
      prisma.shareholdingDistribution.findFirst.mockResolvedValue({ date });
      prisma.shareholdingDistribution.findMany.mockResolvedValue([
        { date, stockCode: '2330', tier: 1, holderCount: 100, shareCount: 1000n, percentage: 1.2 },
      ]);

      const result = await svc.getLatestDistribution('2330');

      expect(result).not.toBeNull();
      expect(result!.date).toBe(date);
      expect(result!.tiers).toHaveLength(1);
    });
  });
});
