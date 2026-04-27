import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { ConfigService } from '@nestjs/config'
import { StockPriceSyncService } from './stock-price-sync.service'
import { DividendSyncService } from './dividend-sync.service'

export interface SyncResult {
  priceRows: number
  dividendRows: number
  durationMs: number
}

@Injectable()
export class SyncSchedulerService {
  private readonly logger = new Logger(SyncSchedulerService.name)
  isRunning = false

  constructor(
    private readonly config: ConfigService,
    private readonly priceSync: StockPriceSyncService,
    private readonly dividendSync: DividendSyncService,
  ) {}

  /**
   * 執行完整同步（股價 + 配息）並回傳摘要
   * @returns 同步結果
   */
  readonly runSync = async (): Promise<SyncResult> => {
    const start = Date.now()
    const today = new Date()

    const priceRows = await this.priceSync.syncDate(today)
    const { total: dividendRows, failed } = await this.dividendSync.syncAll()
    const durationMs = Date.now() - start

    const status = failed.length === 0 ? 'success' : 'partial'
    this.logger.log(
      JSON.stringify({
        type: 'full-sync',
        date: today.toISOString().slice(0, 10),
        priceRows,
        dividendRows,
        durationMs,
        status,
        ...(failed.length ? { failed } : {}),
      }),
    )

    return { priceRows, dividendRows, durationMs }
  }

  /**
   * 每個交易日 15:30（台灣時間）觸發每日股價同步
   * SYNC_ENABLED=true 時才執行
   */
  @Cron('30 15 * * 1-5', { timeZone: 'Asia/Taipei' })
  async scheduleDailyPrice(): Promise<void> {
    if (this.config.get('SYNC_ENABLED') !== 'true') return

    const start = Date.now()
    const today = new Date()
    try {
      const rows = await this.priceSync.syncDate(today)
      this.logger.log(
        JSON.stringify({
          type: 'price-sync',
          date: today.toISOString().slice(0, 10),
          rowsUpserted: rows,
          durationMs: Date.now() - start,
          status: 'success',
        }),
      )
    } catch (err) {
      this.logger.error(`Daily price sync failed: ${err}`)
    }
  }

  /**
   * 每週日 00:00（台灣時間）觸發全量配息同步
   * SYNC_ENABLED=true 時才執行
   */
  @Cron('0 0 * * 0', { timeZone: 'Asia/Taipei' })
  async scheduleWeeklyDividend(): Promise<void> {
    if (this.config.get('SYNC_ENABLED') !== 'true') return

    const start = Date.now()
    try {
      const { total, failed } = await this.dividendSync.syncAll()
      const status = failed.length === 0 ? 'success' : 'partial'
      this.logger.log(
        JSON.stringify({
          type: 'dividend-sync',
          rowsUpserted: total,
          durationMs: Date.now() - start,
          status,
          ...(failed.length ? { failed } : {}),
        }),
      )
    } catch (err) {
      this.logger.error(`Weekly dividend sync failed: ${err}`)
    }
  }
}
