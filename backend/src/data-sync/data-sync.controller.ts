import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  ConflictException,
} from '@nestjs/common'
import { SyncSchedulerService } from './sync-scheduler.service'
import type { SyncResult } from './sync-scheduler.service'

@Controller('data-sync')
export class DataSyncController {
  constructor(private readonly scheduler: SyncSchedulerService) {}

  /**
   * 手動觸發完整資料同步（股價 + 配息）
   * 同步進行中再次呼叫將回傳 409 Conflict
   * @returns 同步結果摘要 { priceRows, dividendRows, durationMs }
   */
  @Post('trigger')
  @HttpCode(HttpStatus.OK)
  async trigger(): Promise<SyncResult> {
    if (this.scheduler.isRunning) {
      throw new ConflictException('Sync is already running')
    }
    this.scheduler.isRunning = true
    try {
      return await this.scheduler.runSync()
    } finally {
      this.scheduler.isRunning = false
    }
  }
}
