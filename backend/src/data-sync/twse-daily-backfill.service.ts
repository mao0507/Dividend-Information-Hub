import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StockPriceSyncService } from './stock-price-sync.service';
import { MARKET_SYNC_KEY_TWSE_STOCK_PRICE_BACKFILL } from './twse-sync.constants';

/** 避免對 TWSE 連續請求過於急促（毫秒） */
const BETWEEN_DAYS_DELAY_MS = 350;

/**
 * @param ms 毫秒
 */
const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

/**
 * 列舉兩個 YYYY-MM-DD（含）之間每日（以 UTC 日序迭代，與回填迴圈一致）
 * @param fromYmd 起始日
 * @param toYmd 結束日
 * @returns 每日正午 UTC 之 Date（供 `syncDate` 推算台北日曆）
 */
const enumerateInclusiveYmd = (fromYmd: string, toYmd: string): Date[] => {
  const parse = (s: string): Date => {
    const [y, m, d] = s.split('-').map((x) => parseInt(x, 10));
    return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  };
  const out: Date[] = [];
  let cur = parse(fromYmd);
  const end = parse(toYmd);
  if (cur.getTime() > end.getTime()) return [];
  while (cur.getTime() <= end.getTime()) {
    out.push(new Date(cur));
    cur = new Date(cur.getTime() + 86400000);
  }
  return out;
};

/**
 * 將 UTC Date 轉為 YYYY-MM-DD（UTC 日曆）
 * @param d 時間
 * @returns YYYY-MM-DD
 */
const utcYmd = (d: Date): string => {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

/**
 * TWSE 上市股價日線歷史回填（逐日呼叫既有 `syncDate`，並維護 checkpoint）
 */
@Injectable()
export class TwseDailyBackfillService {
  private readonly logger = new Logger(TwseDailyBackfillService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly priceSync: StockPriceSyncService,
  ) {}

  /**
   * 依起訖日逐日同步；`resume=true` 時自 `MarketSyncState` 游標次日繼續
   * @param opts 起訖日（YYYY-MM-DD）、是否續跑
   * @returns 處理日數、累計 upsert 筆數、失敗日期清單
   */
  readonly runBackfill = async (opts: {
    fromYmd: string;
    toYmd: string;
    resume: boolean;
  }): Promise<{
    daysProcessed: number;
    totalRows: number;
    failedDates: string[];
  }> => {
    let from = opts.fromYmd;
    const { toYmd } = opts;

    if (opts.resume) {
      const state = await this.prisma.marketSyncState.findUnique({
        where: { key: MARKET_SYNC_KEY_TWSE_STOCK_PRICE_BACKFILL },
      });
      if (state?.lastOkDate) {
        const next = new Date(state.lastOkDate.getTime() + 86400000);
        const nextYmd = utcYmd(next);
        if (nextYmd > from) from = nextYmd;
      }
    }

    const days = enumerateInclusiveYmd(from, toYmd);
    let totalRows = 0;
    let daysProcessed = 0;
    const failedDates: string[] = [];

    for (let i = 0; i < days.length; i++) {
      const dayRef = days[i];
      const ymdLabel = utcYmd(dayRef);
      try {
        const rows = await this.priceSync.syncDate(dayRef);
        totalRows += rows;
        daysProcessed += 1;

        const dateOnly = new Date(
          Date.UTC(
            dayRef.getUTCFullYear(),
            dayRef.getUTCMonth(),
            dayRef.getUTCDate(),
          ),
        );
        await this.prisma.marketSyncState.upsert({
          where: { key: MARKET_SYNC_KEY_TWSE_STOCK_PRICE_BACKFILL },
          create: {
            key: MARKET_SYNC_KEY_TWSE_STOCK_PRICE_BACKFILL,
            lastOkDate: dateOnly,
          },
          update: { lastOkDate: dateOnly },
        });

        this.logger.log(
          JSON.stringify({
            type: 'twse-backfill-day',
            date: ymdLabel,
            rowsUpserted: rows,
            status: 'ok',
          }),
        );
      } catch (err) {
        failedDates.push(ymdLabel);
        this.logger.error(
          JSON.stringify({
            type: 'twse-backfill-day',
            date: ymdLabel,
            status: 'error',
            message: String(err),
          }),
        );
      }

      if (i < days.length - 1) await sleep(BETWEEN_DAYS_DELAY_MS);
    }

    return { daysProcessed, totalRows, failedDates };
  };
}
