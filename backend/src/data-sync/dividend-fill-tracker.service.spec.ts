import { Test } from '@nestjs/testing';
import { DividendFillTrackerService } from './dividend-fill-tracker.service';
import { PrismaService } from '../prisma/prisma.service';

const makeDiv = (overrides: Partial<{
  id: string;
  stockCode: string;
  exDate: Date;
  preExClose: number | null;
}> = {}) => ({
  id: 'div-1',
  stockCode: '2330',
  exDate: new Date(Date.UTC(2023, 2, 16)),
  preExClose: 511,
  ...overrides,
});

describe('DividendFillTrackerService', () => {
  let svc: DividendFillTrackerService;
  let prisma: {
    dividend: { findMany: jest.Mock; update: jest.Mock };
    stockPrice: { findMany: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      dividend: {
        findMany: jest.fn().mockResolvedValue([]),
        update: jest.fn(),
      },
      stockPrice: { findMany: jest.fn().mockResolvedValue([]) },
    };

    const mod = await Test.createTestingModule({
      providers: [
        DividendFillTrackerService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    svc = mod.get(DividendFillTrackerService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('track()', () => {
    it('無待查核紀錄時回傳 checked=0', async () => {
      const result = await svc.track();
      expect(result).toEqual({ checked: 0, filled: 0, skipped: 0 });
    });

    it('preExClose 為 null 的紀錄應被略過', async () => {
      prisma.dividend.findMany.mockResolvedValue([
        makeDiv({ preExClose: null }),
      ]);

      const result = await svc.track();

      expect(result.skipped).toBe(1);
      expect(result.filled).toBe(0);
      expect(prisma.stockPrice.findMany).not.toHaveBeenCalled();
    });

    it('找到填息紀錄後應累計 filled 數', async () => {
      prisma.dividend.findMany.mockResolvedValue([makeDiv()]);
      prisma.stockPrice.findMany.mockResolvedValue([
        { date: new Date(Date.UTC(2023, 2, 20)), close: 515 },
      ]);
      prisma.dividend.update.mockResolvedValue({});

      const result = await svc.track();

      expect(result.filled).toBe(1);
    });
  });

  describe('checkAndUpdateFill()', () => {
    const exDate = new Date(Date.UTC(2023, 2, 16));
    const preExClose = 511;

    it('最終收盤價 >= preExClose 時應 UPDATE filled=true 並計算 fillDays', async () => {
      prisma.stockPrice.findMany.mockResolvedValue([
        { date: new Date(Date.UTC(2023, 2, 17)), close: 505 },
        { date: new Date(Date.UTC(2023, 2, 20)), close: 512 },
      ]);
      prisma.dividend.update.mockResolvedValue({});

      const result = await svc.checkAndUpdateFill('div-1', '2330', exDate, preExClose);

      expect(result).toBe(true);
      expect(prisma.dividend.update).toHaveBeenCalledWith({
        where: { id: 'div-1' },
        data: { filled: true, fillDays: 2 },
      });
    });

    it('第一個交易日即填息時 fillDays 應為 1', async () => {
      prisma.stockPrice.findMany.mockResolvedValue([
        { date: new Date(Date.UTC(2023, 2, 17)), close: 520 },
      ]);
      prisma.dividend.update.mockResolvedValue({});

      await svc.checkAndUpdateFill('div-1', '2330', exDate, preExClose);

      expect(prisma.dividend.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ fillDays: 1 }) }),
      );
    });

    it('無 StockPrice 資料時不應誤判為填息，回傳 false', async () => {
      prisma.stockPrice.findMany.mockResolvedValue([]);

      const result = await svc.checkAndUpdateFill('div-1', '2330', exDate, preExClose);

      expect(result).toBe(false);
      expect(prisma.dividend.update).not.toHaveBeenCalled();
    });

    it('所有收盤價皆低於 preExClose 時回傳 false，不更新', async () => {
      prisma.stockPrice.findMany.mockResolvedValue([
        { date: new Date(Date.UTC(2023, 2, 17)), close: 490 },
        { date: new Date(Date.UTC(2023, 2, 20)), close: 498 },
        { date: new Date(Date.UTC(2023, 2, 21)), close: 505 },
      ]);

      const result = await svc.checkAndUpdateFill('div-1', '2330', exDate, preExClose);

      expect(result).toBe(false);
      expect(prisma.dividend.update).not.toHaveBeenCalled();
    });
  });
});
