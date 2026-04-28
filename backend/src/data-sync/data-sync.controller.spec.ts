import {
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { DataSyncController } from './data-sync.controller';

const mockScheduler = {
  isRunning: false,
  runSync: jest.fn(),
} as any;

const mockTwseBackfill = {
  runBackfill: jest.fn(),
};

const mockValidator = {
  validateOne: jest.fn(),
};

const mockConfig = {
  get: jest.fn((key: string) => {
    if (key === 'DATA_SYNC_SECRET') return 'test-secret' as string;
    return undefined;
  }),
};

const mockDividendBackfill = {
  getStatus: jest.fn().mockReturnValue({ running: false }),
  backfill: jest.fn().mockResolvedValue(undefined),
};

const mockUniverseSync = {
  refresh: jest.fn().mockResolvedValue({ twseAdded: 0, twseUpdated: 0, tpexAdded: 0, tpexUpdated: 0, deactivated: 0, durationMs: 0 }),
};

const mockFillTracker = {
  track: jest.fn().mockResolvedValue({ checked: 0, filled: 0, skipped: 0 }),
};

describe('DataSyncController', () => {
  const controller = new DataSyncController(
    mockScheduler,
    mockTwseBackfill as never,
    mockValidator as never,
    mockConfig as never,
    mockDividendBackfill as never,
    mockUniverseSync as never,
    mockFillTracker as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    mockScheduler.isRunning = false;
  });

  it('returns sync result on successful trigger', async () => {
    mockScheduler.runSync.mockResolvedValue({
      priceRows: 50,
      dividendRows: 10,
      durationMs: 1200,
    });

    const result = await controller.trigger();
    expect(result).toEqual({
      priceRows: 50,
      dividendRows: 10,
      durationMs: 1200,
    });
    expect(mockScheduler.isRunning).toBe(false);
  });

  it('throws 409 Conflict when sync is already running', async () => {
    mockScheduler.isRunning = true;
    await expect(controller.trigger()).rejects.toThrow(ConflictException);
    expect(mockScheduler.runSync).not.toHaveBeenCalled();
  });

  it('resets isRunning to false even if runSync throws', async () => {
    mockScheduler.runSync.mockRejectedValue(new Error('sync failed'));

    await expect(controller.trigger()).rejects.toThrow('sync failed');
    expect(mockScheduler.isRunning).toBe(false);
  });

  describe('backfillPrices', () => {
    it('runs backfill when secret matches', async () => {
      mockTwseBackfill.runBackfill.mockResolvedValue({
        daysProcessed: 5,
        totalRows: 120,
        failedDates: [],
      });

      const result = await controller.backfillPrices('test-secret', {
        fromDate: '2024-01-02',
        toDate: '2024-01-10',
        resume: false,
      });

      expect(mockTwseBackfill.runBackfill).toHaveBeenCalledWith({
        fromYmd: '2024-01-02',
        toYmd: '2024-01-10',
        resume: false,
      });
      expect(result.totalRows).toBe(120);
    });

    it('throws ForbiddenException when DATA_SYNC_SECRET is missing', async () => {
      mockConfig.get.mockReturnValueOnce('' as string);

      await expect(
        controller.backfillPrices('test-secret', {
          fromDate: '2024-01-02',
          toDate: '2024-01-10',
          resume: false,
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws UnauthorizedException when secret mismatches', async () => {
      await expect(
        controller.backfillPrices('wrong-secret', {
          fromDate: '2024-01-02',
          toDate: '2024-01-10',
          resume: false,
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validatePrice', () => {
    it('returns validator result when secret matches', async () => {
      mockValidator.validateOne.mockResolvedValue({ status: 'MATCH' });

      const result = await controller.validatePrice('test-secret', {
        stockCode: '2330',
        date: '2026-04-24',
      });

      expect(mockValidator.validateOne).toHaveBeenCalledWith(
        '2330',
        '2026-04-24',
      );
      expect(result).toEqual({ status: 'MATCH' });
    });

    it('throws ForbiddenException when DATA_SYNC_SECRET is missing', async () => {
      mockConfig.get.mockReturnValueOnce('');

      await expect(
        controller.validatePrice('test-secret', {
          stockCode: '2330',
          date: '2026-04-24',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws UnauthorizedException when secret mismatches', async () => {
      await expect(
        controller.validatePrice('wrong-secret', {
          stockCode: '2330',
          date: '2026-04-24',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
