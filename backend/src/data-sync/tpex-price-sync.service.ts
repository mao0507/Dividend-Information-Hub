import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const TPEX_DAILY_CLOSE_URL =
  'https://www.tpex.org.tw/openapi/v1/tpex_mainboard_daily_close_quotes';
const UA = 'Mozilla/5.0 (compatible; DividendHub/1.0) TpexPriceSync';

const TPEX_RETRY_MAX = 3;
const TPEX_RETRY_BASE_MS = 500;

/** TPEx 全日收盤 API 回應列型別 */
type TpexCloseRow = {
  Date: string;
  SecuritiesCompanyCode: string;
  CompanyName: string;
  Close: string;
  Change: string;
  Open: string;
  High: string;
  Low: string;
  TradingShares: string;
  [key: string]: string;
};

/**
 * 解析數字字串（去除千分位）；無法解析回傳 null
 * @param raw 原始字串
 * @returns 數值或 null
 */
const parseNumberOrNull = (raw: string | undefined): number | null => {
  const n = Number.parseFloat(String(raw ?? '').replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
};

/**
 * 解析成交股數為 bigint；異常格式回傳 0n
 * @param raw 原始字串
 * @returns bigint
 */
const parseVolumeOrZero = (raw: string | undefined): bigint => {
  const compact = String(raw ?? '').replace(/,/g, '').trim();
  if (!/^\d+$/.test(compact)) return 0n;
  try {
    return BigInt(compact);
  } catch {
    return 0n;
  }
};

/**
 * 帶退避的重試 fetch
 * @param url 請求 URL
 * @param init fetch 選項
 * @param maxRetries 最大重試次數
 * @returns Response
 */
const fetchWithRetry = async (
  url: string,
  init: RequestInit,
  maxRetries = TPEX_RETRY_MAX,
): Promise<Response> => {
  let lastErr: unknown;
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const res = await fetch(url, init);
      if (res.ok) return res;
      lastErr = new Error(`HTTP ${res.status}`);
    } catch (e) {
      lastErr = e;
    }
    if (i < maxRetries) {
      await new Promise((r) => setTimeout(r, TPEX_RETRY_BASE_MS * Math.pow(2, i)));
    }
  }
  throw lastErr;
};

@Injectable()
export class TpexPriceSyncService {
  private readonly logger = new Logger(TpexPriceSyncService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 同步 TPEx 上櫃收盤行情至 StockPrice 資料表
   * 只處理 Stock.market='TPEX' 且 isActive=true 的代號
   * @param _date 保留參數（TPEx API 回傳今日資料，date 僅供 log）
   * @returns 成功寫入筆數
   */
  readonly syncDate = async (_date: Date = new Date()): Promise<number> => {
    const res = await fetchWithRetry(TPEX_DAILY_CLOSE_URL, {
      headers: { 'User-Agent': UA },
    });

    const rows = (await res.json()) as TpexCloseRow[];
    if (!Array.isArray(rows) || rows.length === 0) {
      this.logger.log('TpexPriceSync: 無資料（可能為非交易日），跳過');
      return 0;
    }

    const tpexCodes = new Set(
      (
        await this.prisma.stock.findMany({
          where: { market: 'TPEX', isActive: true },
          select: { code: true },
        })
      ).map((s) => s.code),
    );

    let upserted = 0;
    for (const row of rows) {
      const code = String(row.SecuritiesCompanyCode ?? '').trim();
      if (!tpexCodes.has(code)) continue;

      const close = parseNumberOrNull(row.Close);
      const open = parseNumberOrNull(row.Open) ?? close;
      const high = parseNumberOrNull(row.High) ?? close;
      const low = parseNumberOrNull(row.Low) ?? close;
      const volume = parseVolumeOrZero(row.TradingShares);

      if (close === null) {
        this.logger.warn(`TpexPriceSync: ${code} 收盤價格無效，跳過`);
        continue;
      }

      const dateStr = String(row.Date ?? '').trim();
      let date: Date;
      if (/^\d{8}$/.test(dateStr)) {
        const y = parseInt(dateStr.slice(0, 4), 10);
        const m = parseInt(dateStr.slice(4, 6), 10) - 1;
        const d = parseInt(dateStr.slice(6, 8), 10);
        date = new Date(Date.UTC(y, m, d));
      } else {
        const now = new Date();
        const taipeiStr = new Intl.DateTimeFormat('en-CA', {
          timeZone: 'Asia/Taipei',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).format(now);
        const [y, mo, dy] = taipeiStr.split('-').map(Number);
        date = new Date(Date.UTC(y, mo - 1, dy));
      }

      try {
        await this.prisma.stockPrice.upsert({
          where: { stockCode_date: { stockCode: code, date } },
          update: { open: open!, high: high!, low: low!, close, volume },
          create: { stockCode: code, date, open: open!, high: high!, low: low!, close, volume },
        });
        upserted++;
      } catch (err) {
        this.logger.warn(`TpexPriceSync: upsert ${code} 失敗，跳過 — ${err}`);
      }
    }

    return upserted;
  };
}
