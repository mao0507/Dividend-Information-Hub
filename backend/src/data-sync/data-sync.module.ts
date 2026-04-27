import { Module } from '@nestjs/common'
import { DataSyncController } from './data-sync.controller'
import { StockPriceSyncService } from './stock-price-sync.service'
import { DividendSyncService } from './dividend-sync.service'
import { SyncSchedulerService } from './sync-scheduler.service'

@Module({
  controllers: [DataSyncController],
  providers: [StockPriceSyncService, DividendSyncService, SyncSchedulerService],
})
export class DataSyncModule {}
