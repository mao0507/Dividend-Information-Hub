import { TwseDailyBackfillService } from './twse-daily-backfill.service';
import { MARKET_SYNC_KEY_TWSE_STOCK_PRICE_BACKFILL } from './twse-sync.constants';

describe('TwseDailyBackfillService', () => {
  const mockPrisma = {
    marketSyncState: { findUnique: jest.fn(), upsert: jest.fn() },
    stockPrice: { count: jest.fn(), aggregate: jest.fn() },
  };
  const mockPriceSync = {
    syncDate: jest.fn(),
  };

  const service = new TwseDailyBackfillService(
    mockPrisma as never,
    mockPriceSync as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('runs each day and updates checkpoint on success', async () => {
    mockPriceSync.syncDate.mockResolvedValue(10);
    mockPrisma.marketSyncState.upsert.mockResolvedValue({});

    const result = await service.runBackfill({
      fromYmd: '2024-04-01',
      toYmd: '2024-04-03',
      resume: false,
    });

    expect(mockPriceSync.syncDate).toHaveBeenCalledTimes(3);
    expect(mockPrisma.marketSyncState.upsert).toHaveBeenCalledTimes(3);
    expect(result.daysProcessed).toBe(3);
    expect(result.totalRows).toBe(30);
    expect(result.failedDates).toHaveLength(0);

    const lastUpsert = mockPrisma.marketSyncState.upsert.mock.calls[2][0];
    expect(lastUpsert.where.key).toBe(
      MARKET_SYNC_KEY_TWSE_STOCK_PRICE_BACKFILL,
    );
  });

  it('resume skips dates before checkpoint next day', async () => {
    mockPrisma.marketSyncState.findUnique.mockResolvedValue({
      key: MARKET_SYNC_KEY_TWSE_STOCK_PRICE_BACKFILL,
      lastOkDate: new Date(Date.UTC(2024, 3, 2)),
      updatedAt: new Date(),
    });
    mockPriceSync.syncDate.mockResolvedValue(1);
    mockPrisma.marketSyncState.upsert.mockResolvedValue({});

    await service.runBackfill({
      fromYmd: '2024-04-01',
      toYmd: '2024-04-03',
      resume: true,
    });

    /** checkpoint 為 04-02 → 僅同步 04-03 一日 */
    expect(mockPriceSync.syncDate).toHaveBeenCalledTimes(1);
  });

  it('records failed dates when syncDate throws', async () => {
    mockPriceSync.syncDate
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValue(1);
    mockPrisma.marketSyncState.upsert.mockResolvedValue({});

    const result = await service.runBackfill({
      fromYmd: '2024-06-01',
      toYmd: '2024-06-02',
      resume: false,
    });

    expect(result.failedDates).toContain('2024-06-01');
    expect(result.daysProcessed).toBe(1);
    expect(result.totalRows).toBe(1);
  });

  describe('getTaiexStatus', () => {
    it('returns count and date range when TAIEX rows exist', async () => {
      mockPrisma.stockPrice.count.mockResolvedValue(120);
      mockPrisma.stockPrice.aggregate.mockResolvedValue({
        _min: { date: new Date(Date.UTC(2024, 0, 2)) },
        _max: { date: new Date(Date.UTC(2024, 5, 28)) },
      });

      const result = await service.getTaiexStatus();

      expect(result.count).toBe(120);
      expect(result.earliest).toBe('2024-01-02');
      expect(result.latest).toBe('2024-06-28');
    });

    it('returns count 0 and null dates when no TAIEX rows exist', async () => {
      mockPrisma.stockPrice.count.mockResolvedValue(0);
      mockPrisma.stockPrice.aggregate.mockResolvedValue({
        _min: { date: null },
        _max: { date: null },
      });

      const result = await service.getTaiexStatus();

      expect(result.count).toBe(0);
      expect(result.earliest).toBeNull();
      expect(result.latest).toBeNull();
    });
  });

  describe('runTaiexBackfill', () => {
    it('counts trading days as upserted and non-trading as skipped', async () => {
      mockPriceSync.syncDate
        .mockResolvedValueOnce(50)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(48);

      const result = await service.runTaiexBackfill('2024-04-01', '2024-04-03');

      expect(mockPriceSync.syncDate).toHaveBeenCalledTimes(3);
      expect(result.upserted).toBe(2);
      expect(result.skipped).toBe(1);
      expect(result.from).toBe('2024-04-01');
      expect(result.to).toBe('2024-04-03');
    });

    it('counts days where syncDate throws as skipped', async () => {
      mockPriceSync.syncDate
        .mockRejectedValueOnce(new Error('twse down'))
        .mockResolvedValue(10);

      const result = await service.runTaiexBackfill('2024-04-01', '2024-04-02');

      expect(result.skipped).toBe(1);
      expect(result.upserted).toBe(1);
    });
  });
});
