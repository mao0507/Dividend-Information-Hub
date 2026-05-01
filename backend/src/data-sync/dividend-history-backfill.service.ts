import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MARKET_SYNC_KEY_DIVIDEND_HISTORY_BACKFILL } from './twse-sync.constants';
import { inferFreq } from './twse-announcement-sync.service';

const TWSE_TWT49U =
  'https://www.twse.com.tw/rwd/zh/exRight/TWT49U';
const UA = 'Mozilla/5.0 (compatible; DividendHub/1.0) DividendHistoryBackfill';
const BETWEEN_YEARS_DELAY_MS = 500;

/** TWT49U 範圍查詢回應格式 */
type Twt49uResponse = {
  stat: string;
  data?: string[][];
  strDate?: string;
};

/** 填息回填的執行狀態（供 409 回應使用） */
export type BackfillStatus = {
  running: boolean;
  currentYear: number | null;
  completedYears: number[];
  fromYear: number | null;
};

const sleep = (ms: number): Promise<void> =>
  new Promise((r) => setTimeout(r, ms));

/**
 * 將民國年日期字串（例如 "112年03月16日"）轉換為 Date
 * @param rocStr 民國年格式字串
 * @returns Date 或 null
 */
const parseRocDate = (rocStr: string): Date | null => {
  const m = rocStr.match(/(\d+)年(\d+)月(\d+)日/);
  if (!m) return null;
  const year = parseInt(m[1], 10) + 1911;
  const month = parseInt(m[2], 10) - 1;
  const day = parseInt(m[3], 10);
  return new Date(Date.UTC(year, month, day));
};

/**
 * 以 UTC 午夜 Date 格式化為 YYYYMMDD（TWSE 查詢參數）
 * @param d UTC Date
 * @returns YYYYMMDD 字串
 */
const toYyyymmdd = (d: Date): string => {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}${m}${day}`;
};

@Injectable()
export class DividendHistoryBackfillService {
  private readonly logger = new Logger(DividendHistoryBackfillService.name);
  private status: BackfillStatus = {
    running: false,
    currentYear: null,
    completedYears: [],
    fromYear: null,
  };

  constructor(private readonly prisma: PrismaService) {}

  /** 取得目前回填狀態（供 409 回應使用） */
  readonly getStatus = (): BackfillStatus => ({ ...this.status });

  /**
   * 逐年向 TWSE TWT49U 查詢全市場除息紀錄並 upsert 至 Dividend 資料表
   * 支援斷點續跑（從 MarketSyncState 讀取上次進度）
   * @param fromYear 起始年份（預設 2003），若有 checkpoint 則從 checkpoint+1 年繼續
   */
  readonly backfill = async (fromYear = 2003): Promise<void> => {
    if (this.status.running) return;
    this.status = { running: true, currentYear: null, completedYears: [], fromYear };

    const currentYear = new Date().getFullYear();

    const checkpoint = await this.prisma.marketSyncState.findUnique({
      where: { key: MARKET_SYNC_KEY_DIVIDEND_HISTORY_BACKFILL },
    });
    const startYear = checkpoint?.lastOkDate
      ? checkpoint.lastOkDate.getUTCFullYear() + 1
      : fromYear;

    this.logger.log(
      `DividendHistoryBackfill: 從 ${startYear} 年開始（fromYear=${fromYear}，checkpoint=${checkpoint?.lastOkDate?.toISOString() ?? 'none'}）`,
    );

    const trackedCodes = new Set(
      (await this.prisma.stock.findMany({ select: { code: true } })).map(
        (s) => s.code,
      ),
    );

    for (let year = startYear; year <= currentYear; year++) {
      this.status.currentYear = year;
      try {
        const count = await this.backfillYear(year, trackedCodes);
        await this.prisma.marketSyncState.upsert({
          where: { key: MARKET_SYNC_KEY_DIVIDEND_HISTORY_BACKFILL },
          update: { lastOkDate: new Date(Date.UTC(year, 0, 1)) },
          create: {
            key: MARKET_SYNC_KEY_DIVIDEND_HISTORY_BACKFILL,
            lastOkDate: new Date(Date.UTC(year, 0, 1)),
          },
        });
        this.status.completedYears.push(year);
        this.logger.log(`DividendHistoryBackfill: ${year} 年完成，upsert ${count} 筆`);
      } catch (err) {
        this.logger.error(`DividendHistoryBackfill: ${year} 年失敗，跳過 — ${err}`);
      }

      if (year < currentYear) await sleep(BETWEEN_YEARS_DELAY_MS);
    }

    this.status.running = false;
    this.status.currentYear = null;
    this.logger.log('DividendHistoryBackfill: 全部年份完成');

    await this.batchFixFreq();
  };

  /**
   * 查詢單一年份的 TWT49U 並 upsert 回傳的除息紀錄
   * @param year 西元年份
   * @param trackedCodes DB 中已存在的股票代號集合
   * @returns upsert 筆數
   */
  readonly backfillYear = async (
    year: number,
    trackedCodes: Set<string>,
  ): Promise<number> => {
    const startDate = toYyyymmdd(new Date(Date.UTC(year, 0, 1)));
    const endDate = toYyyymmdd(new Date(Date.UTC(year, 11, 31)));
    const url = `${TWSE_TWT49U}?startDate=${startDate}&endDate=${endDate}&response=json`;

    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!res.ok) throw new Error(`TWT49U HTTP ${res.status} for year ${year}`);

    const raw = (await res.json()) as Twt49uResponse;
    if (raw.stat !== 'OK' || !raw.data?.length) return 0;

    let upserted = 0;
    for (const row of raw.data) {
      const code = String(row[1] ?? '').trim();
      if (!trackedCodes.has(code)) continue;

      const type = String(row[6] ?? '').trim();
      if (!type.includes('息')) continue;

      const exDate = parseRocDate(String(row[0] ?? ''));
      if (!exDate) continue;

      const cash = parseFloat(String(row[5] ?? '0').replace(/,/g, '')) || 0;
      if (cash <= 0) continue;

      const preExClose =
        parseFloat(String(row[3] ?? '').replace(/,/g, '')) || null;

      upserted += await this.upsertDividend(code, exDate, cash, preExClose);
    }
    return upserted;
  };

  /**
   * 以 exDate ±3 天視窗比對現有紀錄後 upsert
   * 不覆蓋 filled / fillDays
   * @param stockCode 股票代號
   * @param exDate 除息日
   * @param cash 現金股利
   * @param preExClose 除息前收盤價
   * @returns 1（成功）
   */
  private readonly upsertDividend = async (
    stockCode: string,
    exDate: Date,
    cash: number,
    preExClose: number | null,
  ): Promise<number> => {
    const windowMs = 3 * 86_400_000;
    const existing = await this.prisma.dividend.findFirst({
      where: {
        stockCode,
        exDate: {
          gte: new Date(exDate.getTime() - windowMs),
          lte: new Date(exDate.getTime() + windowMs),
        },
      },
    });

    if (existing) {
      await this.prisma.dividend.update({
        where: { id: existing.id },
        data: {
          cash,
          exDate,
          ...(preExClose !== null ? { preExClose } : {}),
        },
      });
    } else {
      const maxPeriodRow = await this.prisma.dividend.findFirst({
        where: { stockCode, year: exDate.getUTCFullYear() },
        orderBy: { period: 'desc' },
        select: { period: true },
      });
      const period = (maxPeriodRow?.period ?? 0) + 1;
      await this.prisma.dividend.create({
        data: {
          stockCode,
          year: exDate.getUTCFullYear(),
          period,
          freq: inferFreq(period),
          cash,
          exDate,
          ...(preExClose !== null ? { preExClose } : {}),
        },
      });
    }
    return 1;
  };

  /**
   * 批次修正 Dividend 資料表的 freq 欄位
   * 依每支股票每年配息次數重新推算 freq
   */
  readonly batchFixFreq = async (): Promise<void> => {
    this.logger.log('batchFixFreq: 開始批次修正 freq')

    const grouped = await this.prisma.dividend.groupBy({
      by: ['stockCode', 'year'],
      _count: { id: true },
    })

    let updated = 0
    for (const { stockCode, year, _count } of grouped) {
      const freq = inferFreq(_count.id)
      await this.prisma.dividend.updateMany({
        where: { stockCode, year },
        data: { freq },
      })
      updated++
    }

    this.logger.log(`batchFixFreq: 完成，修正 ${updated} 組 (stockCode, year)`)
  };
}
