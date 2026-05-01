import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  fetchTwseSeedUniverseOnline,
  mergeTwseDayAllWithMetadata,
} from '../prisma-seed/twse-seed-universe';
import type { TwseSeedStockRow } from '../prisma-seed/twse-seed-universe.types';

const TPEX_DAILY_CLOSE_URL =
  'https://www.tpex.org.tw/openapi/v1/tpex_mainboard_daily_close_quotes';

const UA = 'Mozilla/5.0 (compatible; DividendHub/1.0) MarketUniverseSync';

/** TPEx 全日收盤 API 回應列型別 */
type TpexCloseRow = {
  SecuritiesCompanyCode: string;
  CompanyName: string;
  [key: string]: string;
};

/** 宇宙刷新結果摘要 */
export type UniverseRefreshResult = {
  twseAdded: number;
  twseUpdated: number;
  tpexAdded: number;
  tpexUpdated: number;
  deactivated: number;
  durationMs: number;
};

/**
 * 從 TPEx tpex_mainboard_daily_close_quotes 取得全市場上櫃股票資訊
 * @returns TwseSeedStockRow 格式（market='TPEX'）的列陣列，失敗時 throw
 */
const fetchTpexUniverse = async (): Promise<
  (TwseSeedStockRow & { market: string })[]
> => {
  const res = await fetch(TPEX_DAILY_CLOSE_URL, {
    headers: { 'User-Agent': UA },
  });
  if (!res.ok) throw new Error(`TPEx daily-close HTTP ${res.status}`);

  const rows = (await res.json()) as TpexCloseRow[];
  if (!Array.isArray(rows) || rows.length === 0) {
    return [];
  }

  const seen = new Set<string>();
  const result: (TwseSeedStockRow & { market: string })[] = [];

  for (const row of rows) {
    const code = String(row.SecuritiesCompanyCode ?? '').trim();
    const name = String(row.CompanyName ?? '').trim();
    if (!code || !name || seen.has(code)) continue;
    seen.add(code);

    const isEtf = /^\d{5,}$/.test(code);
    result.push({
      code,
      name,
      nameAlias: null,
      sector: isEtf ? 'ETF' : '上櫃',
      isEtf,
      pe: null,
      marketCap: null,
      market: 'TPEX',
    });
  }

  return result;
};

@Injectable()
export class MarketUniverseSyncService {
  private readonly logger = new Logger(MarketUniverseSyncService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 同步 TWSE + TPEx 全市場股票清單至 Stock 資料表
   * - 新代號：INSERT isActive=true
   * - 現有代號：UPDATE name（若有變）
   * - 不在清單中的活躍代號：UPDATE isActive=false
   * @returns 本次刷新摘要
   */
  readonly refresh = async (): Promise<UniverseRefreshResult> => {
    const start = Date.now();
    this.logger.log('MarketUniverseSync: 開始刷新 TWSE + TPEx 股票清單');

    const [twseResult, tpexRows] = await Promise.all([
      fetchTwseSeedUniverseOnline(),
      fetchTpexUniverse(),
    ]);

    const twseRows = twseResult.stocks;
    this.logger.log(
      `MarketUniverseSync: TWSE ${twseRows.length} 筆，TPEx ${tpexRows.length} 筆`,
    );

    let twseAdded = 0;
    let twseUpdated = 0;
    let tpexAdded = 0;
    let tpexUpdated = 0;

    const allCodes = new Set<string>();

    for (const row of twseRows) {
      allCodes.add(row.code);
      const existing = await this.prisma.stock.findUnique({
        where: { code: row.code },
        select: { name: true, isActive: true },
      });

      if (!existing) {
        await this.prisma.stock.create({
          data: {
            code: row.code,
            name: row.name,
            sector: row.sector,
            isEtf: row.isEtf,
            market: 'TWSE',
            isActive: true,
          },
        });
        twseAdded++;
      } else {
        const needsUpdate = existing.name !== row.name || !existing.isActive;
        if (needsUpdate) {
          await this.prisma.stock.update({
            where: { code: row.code },
            data: { name: row.name, isActive: true },
          });
          twseUpdated++;
        }
      }
    }

    for (const row of tpexRows) {
      allCodes.add(row.code);
      const existing = await this.prisma.stock.findUnique({
        where: { code: row.code },
        select: { name: true, isActive: true },
      });

      if (!existing) {
        await this.prisma.stock.create({
          data: {
            code: row.code,
            name: row.name,
            sector: row.sector,
            isEtf: row.isEtf,
            market: 'TPEX',
            isActive: true,
          },
        });
        tpexAdded++;
      } else {
        const needsUpdate = existing.name !== row.name || !existing.isActive;
        if (needsUpdate) {
          await this.prisma.stock.update({
            where: { code: row.code },
            data: { name: row.name, isActive: true },
          });
          tpexUpdated++;
        }
      }
    }

    const { count: deactivated } = await this.prisma.stock.updateMany({
      where: {
        isActive: true,
        code: { notIn: [...allCodes] },
        market: { in: ['TWSE', 'TPEX'] },
      },
      data: { isActive: false },
    });

    const durationMs = Date.now() - start;
    this.logger.log(
      JSON.stringify({
        type: 'universe-refresh',
        twseAdded,
        twseUpdated,
        tpexAdded,
        tpexUpdated,
        deactivated,
        durationMs,
        status: 'success',
      }),
    );

    return {
      twseAdded,
      twseUpdated,
      tpexAdded,
      tpexUpdated,
      deactivated,
      durationMs,
    };
  };
}
