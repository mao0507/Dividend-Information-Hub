import { Logger } from '@nestjs/common';
import { DividendRecord, DividendSource } from './dividend-source.interface';

interface FinMindDividendItem {
  stock_id: string;
  date: string;
  CashEarningsDistribution: number;    // 盈餘配息
  CashExDividendTradingDate: string;   // 除息交易日
  CashDividendPaymentDate: string;     // 現金股利發放日
}

interface FinMindResponse {
  status: number;
  msg: string;
  data?: FinMindDividendItem[];
}

/**
 * FinMind TaiwanStockDividend 資料源（需 token + 付費方案）
 * 未設定 token 或權限不足時 throw，由 DividendSyncService 進行 fallback
 */
export class FinMindDividendSource implements DividendSource {
  readonly name = 'FinMind_TaiwanStockDividend';
  private readonly logger = new Logger(FinMindDividendSource.name);
  private readonly BASE_URL = 'https://api.finmindtrade.com/api/v4/data';

  /**
   * @param token FinMind API token（來自環境變數）
   */
  constructor(private readonly token: string) {}

  /**
   * 從 FinMind 取得指定日期後的配息紀錄
   * @param trackedCodes DB 中已追蹤的股票代號集合
   * @returns DividendRecord 陣列；token 缺失或權限不足時 throw
   */
  readonly sync = async (
    trackedCodes: Set<string>,
  ): Promise<DividendRecord[]> => {
    if (!this.token) throw new Error('FinMind token not configured');

    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);
    const startDateStr = startDate.toISOString().slice(0, 10);

    const records: DividendRecord[] = [];

    for (const code of trackedCodes) {
      const url =
        `${this.BASE_URL}?dataset=TaiwanStockDividend` +
        `&data_id=${code}&start_date=${startDateStr}&token=${this.token}`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      const body = (await res.json()) as FinMindResponse;

      if (body.status !== 200) {
        throw new Error(`FinMind API error (${body.status}): ${body.msg}`);
      }

      for (const item of body.data ?? []) {
        if ((item.CashEarningsDistribution ?? 0) <= 0) continue;
        const rawEx = item.CashExDividendTradingDate;
        const rawPay = item.CashDividendPaymentDate;
        const exDate = rawEx && rawEx !== '0' ? new Date(rawEx) : null;
        const payDate = rawPay && rawPay !== '0' ? new Date(rawPay) : null;
        const year = exDate
          ? exDate.getFullYear()
          : new Date(item.date).getFullYear();

        records.push({
          stockCode: item.stock_id,
          year,
          cash: item.CashEarningsDistribution,
          exDate,
          payDate,
          freq: 'annual',
        });
      }
    }

    this.logger.log(`FinMind synced ${records.length} dividend records`);
    return records;
  };
}
