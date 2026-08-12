import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const TDCC_SHAREHOLDING_DISTRIBUTION_URL =
  'https://opendata.tdcc.com.tw/getOD.ashx?id=1-5';
const UA = 'Mozilla/5.0 (compatible; DividendHub/1.0) ChipDataSync';
const FETCH_TIMEOUT_MS = 30_000;
const UPSERT_BATCH_SIZE = 500;
/** TDCC 持股分級 1–15 為實際級距；16（差異數調整）、17（合計）非實際級距，不納入儲存 */
const MAX_REAL_TIER = 15;

/** 股權分散表解析後的單列資料 */
export type ShareholdingDistributionRow = {
  date: Date;
  stockCode: string;
  tier: number;
  holderCount: number;
  shareCount: bigint;
  percentage: number;
};

/** 籌碼資料刷新結果摘要 */
export type ChipDataRefreshResult = {
  rowsUpserted: number;
  skipped: number;
  malformed: number;
  durationMs: number;
};

/**
 * 解析日期字串（YYYYMMDD）為 UTC Date
 * @param raw 原始字串
 * @returns Date，格式不符時回傳 null
 */
const parseDateOrNull = (raw: string | undefined): Date | null => {
  const s = String(raw ?? '').trim();
  if (!/^\d{8}$/.test(s)) return null;
  const y = parseInt(s.slice(0, 4), 10);
  const m = parseInt(s.slice(4, 6), 10) - 1;
  const d = parseInt(s.slice(6, 8), 10);
  return new Date(Date.UTC(y, m, d));
};

/** CSV 解析結果：型別化列陣列 + 格式不符列數 */
export type ParsedShareholdingCsv = {
  rows: ShareholdingDistributionRow[];
  malformed: number;
};

/**
 * 解析 TDCC 集保戶股權分散表 CSV 為型別化列陣列
 * 分級 16（差異數調整）、17（合計）等非實際持股級距的列會被過濾，不計入 malformed
 * @param csv 原始 CSV 文字（含表頭）
 * @returns 解析後的列陣列與格式不符列數（欄位缺漏/型別不符）
 */
export const parseShareholdingDistributionCsv = (
  csv: string,
): ParsedShareholdingCsv => {
  const lines = csv.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length <= 1) return { rows: [], malformed: 0 };

  const rows: ShareholdingDistributionRow[] = [];
  let malformed = 0;

  for (const line of lines.slice(1)) {
    const cols = line.split(',').map((c) => c.trim());
    const [dateRaw, stockCode, tierRaw, holderRaw, shareRaw, pctRaw] = cols;

    const date = parseDateOrNull(dateRaw);
    const tier = Number.parseInt(tierRaw ?? '', 10);
    const holderCount = Number.parseInt(holderRaw ?? '', 10);
    const percentage = Number.parseFloat(pctRaw ?? '');
    const shareStr = String(shareRaw ?? '').trim();

    if (
      !date ||
      !stockCode ||
      !Number.isFinite(tier) ||
      !Number.isFinite(holderCount) ||
      !Number.isFinite(percentage) ||
      !/^\d+$/.test(shareStr)
    ) {
      malformed++;
      continue;
    }

    if (tier > MAX_REAL_TIER) continue; // 合計／差異數調整列，非實際級距

    rows.push({
      date,
      stockCode,
      tier,
      holderCount,
      shareCount: BigInt(shareStr),
      percentage,
    });
  }
  return { rows, malformed };
};

@Injectable()
export class ChipDataSyncService {
  private readonly logger = new Logger(ChipDataSyncService.name);
  private running = false;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 同步集保戶股權分散表至 ShareholdingDistribution 資料表
   * 只處理 DB 中已存在（已追蹤）的股票代號，其餘列跳過；執行中重複呼叫將直接回傳跳過摘要
   * @returns 本次刷新摘要
   */
  readonly refresh = async (): Promise<ChipDataRefreshResult> => {
    if (this.running) {
      this.logger.warn('ChipDataSync: 已有同步進行中，本次呼叫跳過');
      return { rowsUpserted: 0, skipped: 0, malformed: 0, durationMs: 0 };
    }
    this.running = true;
    const start = Date.now();

    try {
      this.logger.log('ChipDataSync: 開始刷新股權分散表');

      const res = await fetch(TDCC_SHAREHOLDING_DISTRIBUTION_URL, {
        headers: { 'User-Agent': UA },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      if (!res.ok) throw new Error(`TDCC shareholding-distribution HTTP ${res.status}`);

      const csv = await res.text();
      const { rows, malformed } = parseShareholdingDistributionCsv(csv);

      if (malformed > 0) {
        this.logger.warn(`ChipDataSync: ${malformed} 列格式不符已跳過`);
      }

      if (!rows.length) {
        this.logger.log('ChipDataSync: 無有效資料，跳過');
        return { rowsUpserted: 0, skipped: 0, malformed, durationMs: Date.now() - start };
      }

      const trackedCodes = new Set(
        (
          await this.prisma.stock.findMany({
            select: { code: true },
          })
        ).map((s) => s.code),
      );

      const toWrite = rows.filter((r) => trackedCodes.has(r.stockCode));
      const skipped = rows.length - toWrite.length;

      let rowsUpserted = 0;
      for (let i = 0; i < toWrite.length; i += UPSERT_BATCH_SIZE) {
        const batch = toWrite.slice(i, i + UPSERT_BATCH_SIZE);
        await this.prisma.$transaction(
          batch.map((row) =>
            this.prisma.shareholdingDistribution.upsert({
              where: {
                stockCode_date_tier: {
                  stockCode: row.stockCode,
                  date: row.date,
                  tier: row.tier,
                },
              },
              update: {
                holderCount: row.holderCount,
                shareCount: row.shareCount,
                percentage: row.percentage,
              },
              create: {
                stockCode: row.stockCode,
                date: row.date,
                tier: row.tier,
                holderCount: row.holderCount,
                shareCount: row.shareCount,
                percentage: row.percentage,
              },
            }),
          ),
        );
        rowsUpserted += batch.length;
      }

      const durationMs = Date.now() - start;
      this.logger.log(
        JSON.stringify({
          type: 'chip-data-sync',
          rowsUpserted,
          skipped,
          malformed,
          durationMs,
          status: 'success',
        }),
      );

      return { rowsUpserted, skipped, malformed, durationMs };
    } finally {
      this.running = false;
    }
  };

  /**
   * 查詢單一股票最新一日股權分散表；查無資料回傳 null
   * @param stockCode 股票代號
   * @returns 最新一日各級距資料，查無資料回傳 null
   */
  readonly getLatestDistribution = async (
    stockCode: string,
  ): Promise<{ date: Date; tiers: ShareholdingDistributionRow[] } | null> => {
    const latest = await this.prisma.shareholdingDistribution.findFirst({
      where: { stockCode },
      orderBy: { date: 'desc' },
      select: { date: true },
    });
    if (!latest) return null;

    const tiers = await this.prisma.shareholdingDistribution.findMany({
      where: { stockCode, date: latest.date },
      orderBy: { tier: 'asc' },
    });

    return {
      date: latest.date,
      tiers: tiers.map((t) => ({
        date: t.date,
        stockCode: t.stockCode,
        tier: t.tier,
        holderCount: t.holderCount,
        shareCount: t.shareCount,
        percentage: t.percentage,
      })),
    };
  };
}
