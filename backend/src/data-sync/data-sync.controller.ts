import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  ConflictException,
  Headers,
  Body,
  ForbiddenException,
  UnauthorizedException,
  Query,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SyncSchedulerService } from './sync-scheduler.service';
import type { SyncResult } from './sync-scheduler.service';
import { TwseDailyBackfillService } from './twse-daily-backfill.service';
import { TwsePriceBackfillDto } from './dto/twse-price-backfill.dto';
import { StockPriceValidateDto } from './dto/stock-price-validate.dto';
import { StockPriceValidationService } from './stock-price-validation.service';
import { DividendHistoryBackfillService } from './dividend-history-backfill.service';
import type { BackfillStatus } from './dividend-history-backfill.service';
import { MarketUniverseSyncService } from './market-universe-sync.service';
import { DividendFillTrackerService } from './dividend-fill-tracker.service';

@Controller('data-sync')
export class DataSyncController {
  constructor(
    private readonly scheduler: SyncSchedulerService,
    private readonly twseBackfill: TwseDailyBackfillService,
    private readonly validator: StockPriceValidationService,
    private readonly config: ConfigService,
    private readonly dividendBackfill: DividendHistoryBackfillService,
    private readonly universeSync: MarketUniverseSyncService,
    private readonly fillTracker: DividendFillTrackerService,
  ) {}

  /**
   * 驗證 `x-data-sync-secret` 與環境變數 `DATA_SYNC_SECRET`
   * @param secret 請求標頭
   */
  private readonly assertDataSyncSecret = (
    secret: string | undefined,
  ): void => {
    const expected = this.config.get<string>('DATA_SYNC_SECRET');
    if (!expected?.trim()) {
      throw new ForbiddenException('DATA_SYNC_SECRET 未設定，無法執行回填');
    }
    if (secret !== expected) {
      throw new UnauthorizedException();
    }
  };

  /**
   * 手動觸發完整資料同步（TWSE + TPEx 股價 + 配息）
   * 同步進行中再次呼叫將回傳 409 Conflict
   * @returns 同步結果摘要 { twsePriceRows, tpexPriceRows, dividendRows, durationMs }
   */
  @Post('trigger')
  @HttpCode(HttpStatus.OK)
  async trigger(): Promise<SyncResult> {
    if (this.scheduler.isRunning) {
      throw new ConflictException('Sync is already running');
    }
    this.scheduler.isRunning = true;
    try {
      return await this.scheduler.runSync();
    } finally {
      this.scheduler.isRunning = false;
    }
  }

  /**
   * 手動觸發全市場股票宇宙刷新（需標頭 `x-data-sync-secret`）
   * 寫入 TWSE + TPEx 全市場代號，停用不在清單中的代號
   * @param secret 與 `DATA_SYNC_SECRET` 一致之金鑰
   * @returns 刷新結果摘要
   */
  @Post('trigger-universe-refresh')
  @HttpCode(HttpStatus.OK)
  async triggerUniverseRefresh(
    @Headers('x-data-sync-secret') secret: string | undefined,
  ) {
    this.assertDataSyncSecret(secret);
    return this.universeSync.refresh();
  }

  /**
   * 手動觸發填息追蹤計算（需標頭 `x-data-sync-secret`）
   * 掃描所有尚未填息紀錄並更新 filled/fillDays
   * @param secret 與 `DATA_SYNC_SECRET` 一致之金鑰
   * @returns 查核數、填息數、略過數
   */
  @Post('trigger-fill-tracker')
  @HttpCode(HttpStatus.OK)
  async triggerFillTracker(
    @Headers('x-data-sync-secret') secret: string | undefined,
  ) {
    this.assertDataSyncSecret(secret);
    return this.fillTracker.track();
  }

  /**
   * 非同步啟動配息歷史回填（需標頭 `x-data-sync-secret`）
   * 執行中再次呼叫回傳 409 含目前進度
   * @param secret 與 `DATA_SYNC_SECRET` 一致之金鑰
   * @param fromYear 起始年份（預設 2003）
   * @returns 啟動確認或 409 進度
   */
  @Post('backfill-dividends')
  @HttpCode(HttpStatus.ACCEPTED)
  async backfillDividends(
    @Headers('x-data-sync-secret') secret: string | undefined,
    @Query('fromYear') fromYear?: string,
  ): Promise<{ message: string; fromYear: number } | BackfillStatus> {
    this.assertDataSyncSecret(secret);

    const status = this.dividendBackfill.getStatus();
    if (status.running) {
      throw new ConflictException(status);
    }

    const year = fromYear ? parseInt(fromYear, 10) : 2003;
    void this.dividendBackfill.backfill(year);

    return { message: 'Backfill started', fromYear: year };
  }

  /**
   * TWSE 上市股價日線區間回填（需標頭 `x-data-sync-secret`）
   * @param secret 與 `DATA_SYNC_SECRET` 一致之金鑰
   * @param body 起訖日、是否自 checkpoint 續跑
   * @returns 處理日數、累計筆數、失敗日期
   */
  @Post('backfill/prices')
  @HttpCode(HttpStatus.OK)
  async backfillPrices(
    @Headers('x-data-sync-secret') secret: string | undefined,
    @Body() body: TwsePriceBackfillDto,
  ): Promise<{
    daysProcessed: number;
    totalRows: number;
    failedDates: string[];
  }> {
    this.assertDataSyncSecret(secret);
    return this.twseBackfill.runBackfill({
      fromYmd: body.fromDate,
      toYmd: body.toDate,
      resume: body.resume ?? false,
    });
  }

  /**
   * 單點股價資料正確性驗證（需標頭 `x-data-sync-secret`）
   * @param secret 與 `DATA_SYNC_SECRET` 一致之金鑰
   * @param body 驗證參數（股票代號與日期）
   * @returns 驗證結果與差異原因
   */
  @Post('validate/price')
  @HttpCode(HttpStatus.OK)
  async validatePrice(
    @Headers('x-data-sync-secret') secret: string | undefined,
    @Body() body: StockPriceValidateDto,
  ) {
    this.assertDataSyncSecret(secret);
    return this.validator.validateOne(body.stockCode, body.date);
  }
}
