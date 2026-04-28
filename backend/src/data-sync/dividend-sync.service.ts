import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

const TWSE_TWT49U = 'https://www.twse.com.tw/rwd/zh/exRight/TWT49U';
const UA = 'Mozilla/5.0 (compatible; DividendHub/1.0) DividendSync';

/** 每週同步往回查詢的天數（涵蓋可能延遲公告） */
const SYNC_LOOKBACK_DAYS = 35;

export interface SyncAllResult {
  total: number;
  failed: string[];
}

type Twt49uResponse = {
  stat: string;
  data?: string[][];
};

/**
 * 將民國年日期字串轉換為 Date（UTC 午夜）
 * @param rocStr 民國年格式字串，例如 "115年04月24日"
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
 * 格式化 Date 為 YYYYMMDD（UTC 日曆）
 * @param d Date
 * @returns YYYYMMDD 字串
 */
const toYyyymmdd = (d: Date): string => {
  const y = d.getUTCFullYear();
  const mo = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dy = String(d.getUTCDate()).padStart(2, '0');
  return `${y}${mo}${dy}`;
};

@Injectable()
export class DividendSyncService {
  private readonly logger = new Logger(DividendSyncService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  /**
   * 以 TWT49U startDate+endDate 範圍查詢，同步過去 35 天的全市場除息結果
   * 不使用逐股 FinMind 呼叫（保留 FINMIND_ENABLED 選項供未來擴充）
   * @returns 總 upsert 筆數與失敗清單
   */
  readonly syncAll = async (): Promise<SyncAllResult> => {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - SYNC_LOOKBACK_DAYS * 86_400_000);

    const startStr = toYyyymmdd(startDate);
    const endStr = toYyyymmdd(endDate);
    const url = `${TWSE_TWT49U}?startDate=${startStr}&endDate=${endStr}&response=json`;

    this.logger.log(`DividendSync: TWT49U 範圍查詢 ${startStr}~${endStr}`);

    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA } });
      if (!res.ok) throw new Error(`TWT49U HTTP ${res.status}`);

      const raw = (await res.json()) as Twt49uResponse;
      if (raw.stat !== 'OK' || !raw.data?.length) {
        this.logger.log('DividendSync: 無除息資料，跳過');
        return { total: 0, failed: [] };
      }

      const trackedCodes = new Set(
        (await this.prisma.stock.findMany({ select: { code: true } })).map(
          (s) => s.code,
        ),
      );

      const total = await this.upsertRows(raw.data, trackedCodes);
      this.logger.log(`DividendSync: 完成，upsert ${total} 筆`);
      return { total, failed: [] };
    } catch (err) {
      this.logger.error(`DividendSync: TWT49U 失敗 — ${err}`);
      return { total: 0, failed: ['TWSE_TWT49U'] };
    }
  };

  /**
   * 解析 TWT49U data 列並 upsert 至 Dividend 資料表
   * 不覆蓋 filled / fillDays
   * @param rows TWT49U 回應的 data 陣列
   * @param trackedCodes 已追蹤股票代號集合
   * @returns upsert 筆數
   */
  readonly upsertRows = async (
    rows: string[][],
    trackedCodes: Set<string>,
  ): Promise<number> => {
    let upserted = 0;
    for (const row of rows) {
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

      try {
        const windowMs = 7 * 86_400_000;
        const existing = await this.prisma.dividend.findFirst({
          where: {
            stockCode: code,
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
            where: { stockCode: code, year: exDate.getUTCFullYear() },
            orderBy: { period: 'desc' },
            select: { period: true },
          });
          const period = (maxPeriodRow?.period ?? 0) + 1;
          await this.prisma.dividend.create({
            data: {
              stockCode: code,
              year: exDate.getUTCFullYear(),
              period,
              freq: 'annual',
              cash,
              exDate,
              ...(preExClose !== null ? { preExClose } : {}),
            },
          });
        }
        upserted++;
      } catch (err) {
        this.logger.warn(
          `DividendSync: upsert ${code} exDate ${exDate.toISOString()} 失敗 — ${err}`,
        );
      }
    }
    return upserted;
  };
}
