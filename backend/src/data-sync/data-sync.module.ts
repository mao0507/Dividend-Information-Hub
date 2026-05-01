import { Module } from '@nestjs/common';
import { DataSyncController } from './data-sync.controller';
import { StockPriceSyncService } from './stock-price-sync.service';
import { TpexPriceSyncService } from './tpex-price-sync.service';
import { DividendSyncService } from './dividend-sync.service';
import { DividendFillTrackerService } from './dividend-fill-tracker.service';
import { DividendHistoryBackfillService } from './dividend-history-backfill.service';
import { MarketUniverseSyncService } from './market-universe-sync.service';
import { SyncSchedulerService } from './sync-scheduler.service';
import { TwseDailyBackfillService } from './twse-daily-backfill.service';
import { StockPriceValidationService } from './stock-price-validation.service';
import { TwseDividendAnnouncementSyncService } from './twse-announcement-sync.service';

@Module({
  controllers: [DataSyncController],
  providers: [
    StockPriceSyncService,
    TpexPriceSyncService,
    TwseDividendAnnouncementSyncService,
    DividendSyncService,
    DividendFillTrackerService,
    DividendHistoryBackfillService,
    MarketUniverseSyncService,
    SyncSchedulerService,
    TwseDailyBackfillService,
    StockPriceValidationService,
  ],
})
export class DataSyncModule {}
