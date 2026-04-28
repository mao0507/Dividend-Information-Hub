import { Logger } from '@nestjs/common';
import { DividendRecord, DividendSource } from './dividend-source.interface';

interface TwseExDivResponse {
  stat: string;
  fields?: string[];
  data?: string[][];
}

/**
 * TWSE TWT49U 除息結果資料源（免費，公開）
 */
export class TwseDividendSource implements DividendSource {
  readonly name = 'TWSE_TWT49U';
  private readonly logger = new Logger(TwseDividendSource.name);
  private readonly BASE_URL = 'https://www.twse.com.tw/rwd/zh/exRight/TWT49U';

  /**
   * 將民國年日期字串轉換為 Date，例如 "115年04月24日" → 2026-04-24
   * @param rocStr 民國年格式字串
   * @returns Date 或 null
   */
  private readonly parseRocDate = (rocStr: string): Date | null => {
    const match = rocStr.match(/(\d+)年(\d+)月(\d+)日/);
    if (!match) return null;
    const year = parseInt(match[1], 10) + 1911;
    const month = parseInt(match[2], 10) - 1;
    const day = parseInt(match[3], 10);
    return new Date(year, month, day);
  };

  /**
   * 格式化日期為 YYYYMMDD
   * @param date 日期
   * @returns YYYYMMDD 字串
   */
  private readonly formatDate = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}${m}${d}`;
  };

  /**
   * 從 TWSE 取得最近除息公告並轉換為 DividendRecord 陣列
   * @param trackedCodes DB 中已追蹤的股票代號集合
   * @returns DividendRecord 陣列
   */
  readonly sync = async (
    trackedCodes: Set<string>,
  ): Promise<DividendRecord[]> => {
    const dateStr = this.formatDate(new Date());
    const url = `${this.BASE_URL}?date=${dateStr}&response=json`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) throw new Error(`TWSE TWT49U HTTP ${res.status}`);

    const raw = (await res.json()) as TwseExDivResponse;
    if (raw.stat !== 'OK' || !raw.data?.length) {
      this.logger.log('TWSE TWT49U: no ex-dividend data available');
      return [];
    }

    const records: DividendRecord[] = [];
    for (const row of raw.data) {
      // row[0]=除息日(民國), row[1]=代號, row[5]=息值, row[6]=權/息
      const code = (row[1] ?? '').trim();
      if (!trackedCodes.has(code)) continue;

      const type = (row[6] ?? '').trim();
      if (!type.includes('息')) continue;

      const cash = parseFloat(row[5] ?? '0') || 0;
      if (cash <= 0) continue;

      const exDate = this.parseRocDate(row[0] ?? '');
      if (!exDate) continue;

      records.push({
        stockCode: code,
        year: exDate.getFullYear(),
        cash,
        exDate,
        freq: 'annual',
      });
    }
    return records;
  };
}
