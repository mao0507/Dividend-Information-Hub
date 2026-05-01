import { Test } from '@nestjs/testing';
import { DividendHistoryBackfillService } from './dividend-history-backfill.service';
import { PrismaService } from '../prisma/prisma.service';
import { MARKET_SYNC_KEY_DIVIDEND_HISTORY_BACKFILL } from './twse-sync.constants';

const makeTwt49uRow = (
  rocDate: string,
  code: string,
  preExClose: string,
  cash: string,
  type = '息',
): string[] => [rocDate, code, '公司名', preExClose, '0', cash, type, '0', '0', '0', '0'];

const mockFetch = (data: string[][], stat = 'OK') => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ stat, data }),
  } as unknown as Response);
};

describe('DividendHistoryBackfillService', () => {
  let svc: DividendHistoryBackfillService;
  let prisma: {
    stock: { findMany: jest.Mock };
    dividend: { findFirst: jest.Mock; update: jest.Mock; create: jest.Mock };
    marketSyncState: { findUnique: jest.Mock; upsert: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      stock: { findMany: jest.fn().mockResolvedValue([{ code: '2330' }]) },
      dividend: {
        findFirst: jest.fn().mockResolvedValue(null),
        update: jest.fn(),
        create: jest.fn(),
        groupBy: jest.fn().mockResolvedValue([]),
        updateMany: jest.fn(),
      },
      marketSyncState: {
        findUnique: jest.fn().mockResolvedValue(null),
        upsert: jest.fn(),
      },
    };

    const mod = await Test.createTestingModule({
      providers: [
        DividendHistoryBackfillService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    svc = mod.get(DividendHistoryBackfillService);
  });

  afterEach(() => jest.clearAllMocks());

  it('單年查詢：應解析 TWT49U 並寫入 Dividend', async () => {
    mockFetch([makeTwt49uRow('112年03月16日', '2330', '511.00', '2.75')]);
    const trackedCodes = new Set(['2330']);
    const count = await svc.backfillYear(2023, trackedCodes);
    expect(prisma.dividend.create).toHaveBeenCalledTimes(1);
    expect(count).toBe(1);
  });

  it('非追蹤代號應跳過', async () => {
    mockFetch([makeTwt49uRow('112年03月16日', '9999', '100', '1')]);
    const count = await svc.backfillYear(2023, new Set(['2330']));
    expect(prisma.dividend.create).not.toHaveBeenCalled();
    expect(count).toBe(0);
  });

  it('已存在 exDate±3天 的紀錄應 UPDATE 而非 INSERT', async () => {
    prisma.dividend.findFirst.mockResolvedValue({ id: 'div-1' });
    mockFetch([makeTwt49uRow('112年03月16日', '2330', '511.00', '2.75')]);
    await svc.backfillYear(2023, new Set(['2330']));
    expect(prisma.dividend.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'div-1' } }),
    );
    expect(prisma.dividend.create).not.toHaveBeenCalled();
  });

  it('斷點續跑：checkpoint 存在時應從下一年開始', async () => {
    const checkpointDate = new Date(Date.UTC(2024, 0, 1));
    prisma.marketSyncState.findUnique.mockResolvedValue({ lastOkDate: checkpointDate });
    mockFetch([]);
    const currentYear = new Date().getFullYear();
    jest.spyOn(svc, 'backfillYear').mockResolvedValue(0);

    await svc.backfill(2003);

    const calls = (svc.backfillYear as jest.Mock).mock.calls.map((c) => c[0] as number);
    expect(calls[0]).toBe(2025);
    expect(calls.every((y) => y >= 2025 && y <= currentYear)).toBe(true);
  });

  it('單年失敗時應跳過並繼續下一年，不中止整體', async () => {
    jest.useFakeTimers();
    const currentYear = new Date().getFullYear();
    prisma.marketSyncState.findUnique.mockResolvedValue(null);

    let callCount = 0;
    jest.spyOn(svc, 'backfillYear').mockImplementation(async (year) => {
      callCount++;
      if (year === 2003) throw new Error('API error');
      return 0;
    });

    const promise = svc.backfill(2003);
    await jest.runAllTimersAsync();
    await promise;

    expect(callCount).toBe(currentYear - 2003 + 1);
    jest.useRealTimers();
  });
});
