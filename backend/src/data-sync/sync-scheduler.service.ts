import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { StockPriceSyncService } from './stock-price-sync.service';
import { TpexPriceSyncService } from './tpex-price-sync.service';
import { DividendSyncService } from './dividend-sync.service';
import { DividendFillTrackerService } from './dividend-fill-tracker.service';
import { MarketUniverseSyncService } from './market-universe-sync.service';

export interface SyncResult {
  twsePriceRows: number;
  tpexPriceRows: number;
  dividendRows: number;
  durationMs: number;
}

@Injectable()
export class SyncSchedulerService {
  private readonly logger = new Logger(SyncSchedulerService.name);
  isRunning = false;

  constructor(
    private readonly config: ConfigService,
    private readonly priceSync: StockPriceSyncService,
    private readonly tpexPriceSync: TpexPriceSyncService,
    private readonly dividendSync: DividendSyncService,
    private readonly fillTracker: DividendFillTrackerService,
    private readonly universeSync: MarketUniverseSyncService,
  ) {}

  /**
   * 執行完整同步（TWSE + TPEx 股價、配息）並回傳摘要
   * TWSE 失敗不影響 TPEx 繼續執行
   * @returns 同步結果
   */
  readonly runSync = async (): Promise<SyncResult> => {
    const start = Date.now();
    const today = new Date();

    const [twsePriceRows, tpexPriceRows] = await Promise.allSettled([
      this.priceSync.syncDate(today),
      this.tpexPriceSync.syncDate(today),
    ]).then(([twseResult, tpexResult]) => {
      const twse = twseResult.status === 'fulfilled' ? twseResult.value : 0;
      const tpex = tpexResult.status === 'fulfilled' ? tpexResult.value : 0;
      if (twseResult.status === 'rejected') {
        this.logger.error(`TWSE price sync failed: ${twseResult.reason}`);
      }
      if (tpexResult.status === 'rejected') {
        this.logger.error(`TPEx price sync failed: ${tpexResult.reason}`);
      }
      return [twse, tpex];
    });

    const { total: dividendRows, failed } = await this.dividendSync.syncAll();
    const durationMs = Date.now() - start;

    const status = failed.length === 0 ? 'success' : 'partial';
    this.logger.log(
      JSON.stringify({
        type: 'full-sync',
        twsePriceRows,
        tpexPriceRows,
        dividendRows,
        durationMs,
        status,
        ...(failed.length ? { failed } : {}),
      }),
    );

    return { twsePriceRows, tpexPriceRows, dividendRows, durationMs };
  };

  /**
   * 每個交易日 15:30（台灣時間）觸發 TWSE 及 TPEx 股價同步
   * TWSE 失敗不影響 TPEx 執行
   * SYNC_ENABLED=true 時才執行
   */
  @Cron('30 15 * * 1-5', { timeZone: 'Asia/Taipei' })
  async scheduleDailyPrice(): Promise<void> {
    if (this.config.get('SYNC_ENABLED') !== 'true') return;

    const start = Date.now();
    const today = new Date();

    const [twseResult, tpexResult] = await Promise.allSettled([
      this.priceSync.syncDate(today),
      this.tpexPriceSync.syncDate(today),
    ]);

    const twsePriceRows = twseResult.status === 'fulfilled' ? twseResult.value : 0;
    const tpexPriceRows = tpexResult.status === 'fulfilled' ? tpexResult.value : 0;

    if (twseResult.status === 'rejected') {
      this.logger.error(`Price cron — TWSE failed: ${twseResult.reason}`);
    }
    if (tpexResult.status === 'rejected') {
      this.logger.error(`Price cron — TPEx failed: ${tpexResult.reason}`);
    }

    this.logger.log(
      JSON.stringify({
        type: 'price-sync',
        twsePriceRows,
        tpexPriceRows,
        durationMs: Date.now() - start,
        status: twseResult.status === 'rejected' || tpexResult.status === 'rejected' ? 'partial' : 'success',
      }),
    );
  }

  /**
   * 每個交易日 16:00（台灣時間）觸發填息追蹤
   * SYNC_ENABLED=true 時才執行
   */
  @Cron('0 16 * * 1-5', { timeZone: 'Asia/Taipei' })
  async scheduleDailyFillTracker(): Promise<void> {
    if (this.config.get('SYNC_ENABLED') !== 'true') return;

    const start = Date.now();
    try {
      const result = await this.fillTracker.track();
      this.logger.log(
        JSON.stringify({
          type: 'fill-tracker',
          ...result,
          durationMs: Date.now() - start,
          status: 'success',
        }),
      );
    } catch (err) {
      this.logger.error(`Fill tracker cron failed: ${err}`);
    }
  }

  /**
   * 每週日 01:00（台灣時間）觸發全市場股票宇宙刷新
   * SYNC_ENABLED=true 時才執行
   */
  @Cron('0 1 * * 0', { timeZone: 'Asia/Taipei' })
  async scheduleWeeklyUniverseRefresh(): Promise<void> {
    if (this.config.get('SYNC_ENABLED') !== 'true') return;

    const start = Date.now();
    try {
      const result = await this.universeSync.refresh();
      this.logger.log(
        JSON.stringify({
          type: 'universe-refresh',
          ...result,
          durationMs: Date.now() - start,
          status: 'success',
        }),
      );
    } catch (err) {
      this.logger.error(`Universe refresh cron failed: ${err}`);
    }
  }

  /**
   * 每週日 00:00（台灣時間）觸發全量配息同步
   * SYNC_ENABLED=true 時才執行
   */
  @Cron('0 0 * * 0', { timeZone: 'Asia/Taipei' })
  async scheduleWeeklyDividend(): Promise<void> {
    if (this.config.get('SYNC_ENABLED') !== 'true') return;

    const start = Date.now();
    try {
      const { total, failed } = await this.dividendSync.syncAll();
      const status = failed.length === 0 ? 'success' : 'partial';
      this.logger.log(
        JSON.stringify({
          type: 'dividend-sync',
          rowsUpserted: total,
          durationMs: Date.now() - start,
          status,
          ...(failed.length ? { failed } : {}),
        }),
      );
    } catch (err) {
      this.logger.error(`Weekly dividend sync failed: ${err}`);
    }
  }
}
