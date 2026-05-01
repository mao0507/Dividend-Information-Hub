import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { DividendSyncService } from './dividend-sync.service';
import { PrismaService } from '../prisma/prisma.service';
import { TwseDividendAnnouncementSyncService } from './twse-announcement-sync.service';

/**
 * 建立 TWT49U 回應列
 * row[0]=民國日期, row[1]=代號, row[2]=名稱, row[3]=除息前收盤, row[4]=開盤, row[5]=息值, row[6]=類型
 */
const makeRow = (
  rocDate: string,
  code: string,
  preExClose: string,
  cash: string,
  type = '息',
): string[] => [rocDate, code, '公司名', preExClose, '0', cash, type, '0', '0', '0'];

const mockFetch = (data: string[][], stat = 'OK') => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ stat, data }),
  } as unknown as Response);
};

describe('DividendSyncService', () => {
  let svc: DividendSyncService;
  let prisma: {
    stock: { findMany: jest.Mock };
    dividend: { findFirst: jest.Mock; update: jest.Mock; create: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      stock: { findMany: jest.fn().mockResolvedValue([{ code: '2330' }]) },
      dividend: {
        findFirst: jest.fn().mockResolvedValue(null),
        update: jest.fn(),
        create: jest.fn(),
      },
    };

    const mod = await Test.createTestingModule({
      providers: [
        DividendSyncService,
        { provide: PrismaService, useValue: prisma },
        { provide: ConfigService, useValue: { get: jest.fn() } },
        {
          provide: TwseDividendAnnouncementSyncService,
          useValue: { sync: jest.fn().mockResolvedValue(0) },
        },
      ],
    }).compile();

    svc = mod.get(DividendSyncService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('syncAll — TWT49U 範圍查詢', () => {
    it('以 startDate(今日-35天) 和 endDate(今日) 呼叫 TWT49U', async () => {
      mockFetch([makeRow('115年04月24日', '2330', '511', '3.0')]);
      prisma.dividend.findFirst.mockResolvedValue(null);
      prisma.dividend.create.mockResolvedValue({});

      await svc.syncAll();

      const url: string = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(url).toContain('startDate=');
      expect(url).toContain('endDate=');
      expect(url).toContain('response=json');

      const startDateMatch = url.match(/startDate=(\d{8})/);
      const endDateMatch = url.match(/endDate=(\d{8})/);
      expect(startDateMatch).not.toBeNull();
      expect(endDateMatch).not.toBeNull();

      const parseYmd = (ymd: string): Date =>
        new Date(Date.UTC(
          parseInt(ymd.slice(0, 4), 10),
          parseInt(ymd.slice(4, 6), 10) - 1,
          parseInt(ymd.slice(6, 8), 10),
        ));
      const diffDays =
        (parseYmd(endDateMatch![1]).getTime() - parseYmd(startDateMatch![1]).getTime()) /
        86_400_000;
      expect(diffDays).toBeGreaterThanOrEqual(34);
      expect(diffDays).toBeLessThanOrEqual(36);
    });

    it('成功 upsert 並回傳 total', async () => {
      mockFetch([makeRow('115年04月24日', '2330', '511', '3.0')]);
      prisma.dividend.create.mockResolvedValue({});

      const { total, failed } = await svc.syncAll();

      expect(total).toBe(1);
      expect(failed).toHaveLength(0);
    });

    it('stat 非 OK 時回傳 { total: 0, failed: [] }', async () => {
      mockFetch([], 'EMPTY');

      const { total, failed } = await svc.syncAll();

      expect(total).toBe(0);
      expect(failed).toHaveLength(0);
    });

    it('fetch 失敗時回傳 { total: 0, failed: [\'TWSE_TWT49U\'] }', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 503,
      } as unknown as Response);

      const { total, failed } = await svc.syncAll();

      expect(total).toBe(0);
      expect(failed).toContain('TWSE_TWT49U');
    });
  });

  describe('upsertRows — 解析 TWT49U 欄位', () => {
    const tracked = new Set(['2330']);

    it('解析民國日期、cash(row[5])、preExClose(row[3]) 並 INSERT', async () => {
      await svc.upsertRows(
        [makeRow('112年03月16日', '2330', '511.00', '2.75')],
        tracked,
      );

      expect(prisma.dividend.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            stockCode: '2330',
            cash: 2.75,
            preExClose: 511,
            exDate: new Date(Date.UTC(2023, 2, 16)),
          }),
        }),
      );
    });

    it('非追蹤代號應跳過', async () => {
      await svc.upsertRows(
        [makeRow('115年04月24日', '9999', '100', '1.0')],
        tracked,
      );
      expect(prisma.dividend.create).not.toHaveBeenCalled();
    });

    it('類型不含「息」字應跳過（純權息）', async () => {
      await svc.upsertRows(
        [makeRow('115年04月24日', '2330', '100', '1.0', '權')],
        tracked,
      );
      expect(prisma.dividend.create).not.toHaveBeenCalled();
    });

    it('cash <= 0 應跳過', async () => {
      await svc.upsertRows(
        [makeRow('115年04月24日', '2330', '100', '0')],
        tracked,
      );
      expect(prisma.dividend.create).not.toHaveBeenCalled();
    });

    it('±7 天內已有紀錄時應 UPDATE，不 INSERT', async () => {
      prisma.dividend.findFirst.mockResolvedValue({ id: 'div-1' });

      await svc.upsertRows(
        [makeRow('115年04月24日', '2330', '511', '3.0')],
        tracked,
      );

      expect(prisma.dividend.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'div-1' } }),
      );
      expect(prisma.dividend.create).not.toHaveBeenCalled();
    });

    it('UPDATE 時不覆蓋 filled / fillDays', async () => {
      prisma.dividend.findFirst.mockResolvedValue({ id: 'div-1', filled: true, fillDays: 5 });

      await svc.upsertRows(
        [makeRow('115年04月24日', '2330', '511', '3.0')],
        tracked,
      );

      const updateCall = prisma.dividend.update.mock.calls[0][0];
      expect(updateCall.data).not.toHaveProperty('filled');
      expect(updateCall.data).not.toHaveProperty('fillDays');
    });

    it('多筆列應累計回傳 upsert 數', async () => {
      prisma.dividend.create.mockResolvedValue({});

      const count = await svc.upsertRows(
        [
          makeRow('112年03月16日', '2330', '511', '2.75'),
          makeRow('113年03月21日', '2330', '820', '3.0'),
        ],
        tracked,
      );

      expect(count).toBe(2);
    });
  });
});
