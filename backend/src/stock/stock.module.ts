import { Module } from '@nestjs/common'
import { StockController } from './stock.controller'
import { StockService } from './stock.service'
import { StockPriceSyncService } from '../data-sync/stock-price-sync.service'

@Module({
  controllers: [StockController],
  providers: [StockService, StockPriceSyncService],
  exports: [StockService],
})
export class StockModule {}
