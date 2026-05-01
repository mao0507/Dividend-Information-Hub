import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type TwseMiIndexTable = {
  fields?: string[];
  data?: string[][];
};

type TwseMiIndexResponse = {
  stat: string;
  tables?: TwseMiIndexTable[];
};

type TwseDailyQuote = {
  code: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: bigint;
};

const TWSE_RETRY_MAX = 3;
const TWSE_RETRY_BASE_MS = 1000;

/**
 * 將任意時間轉為台北當日日曆分量（供 TWSE `date=YYYYMMDD` 與 DB `@db.Date` 對齊）
 * @param d 參考時間（通常為 `new Date()`）
 * @returns 西元年、月、日
 */
const getYmdInTaipei = (d: Date): { y: number; m: number; day: number } => {
  const s = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
  const [y, m, day] = s.split('-').map((x) => parseInt(x, 10));
  return { y, m, day };
};

/**
 * 台北日曆日對應之 UTC 午夜（PostgreSQL DATE 僅存日序）
 * @param y 年
 * @param m 月 1–12
 * @param day 日
 * @returns Date
 */
const calendarDateToUtcDate = (y: number, m: number, day: number): Date =>
  new Date(Date.UTC(y, m - 1, day));

/**
 * 解析數字字串（去除千分位）；無法解析回傳 0
 * @param raw 原始字串
 * @returns 數值
 */
const parseNumberOrZero = (raw: string | undefined): number => {
  const n = Number.parseFloat(String(raw ?? '').replace(/,/g, ''));
  return Number.isFinite(n) ? n : 0;
};

/**
 * 解析成交股數為 bigint；異常格式回傳 0n，避免單筆壞資料中斷整日同步
 * @param raw 原始成交股數字串
 * @returns 成交股數
 */
const parseVolumeOrZero = (raw: string | undefined): bigint => {
  const compact = String(raw ?? '')
    .replace(/,/g, '')
    .trim();
  if (!/^\d+$/.test(compact)) return 0n;
  try {
    return BigInt(compact);
  } catch {
    return 0n;
  }
};

/**
 * 由 MI_INDEX 回應的「價格指數」table 抽取發行量加權股價指數收盤值。
 * @param raw TWSE MI_INDEX 回應
 * @returns 加權指數收盤點數，無資料或格式異常時回傳 null
 */
export const parseTwseMiIndexTaiex = (
  raw: TwseMiIndexResponse,
): number | null => {
  if (raw.stat !== 'OK' || !Array.isArray(raw.tables)) return null;

  const indexTable = raw.tables.find((t) => {
    const fields = t.fields ?? [];
    return fields.includes('指數') && fields.includes('收盤指數');
  });
  if (!indexTable?.data?.length) return null;

  const fields = indexTable.fields ?? [];
  const idxName = fields.indexOf('指數');
  const idxClose = fields.indexOf('收盤指數');
  if (idxName < 0 || idxClose < 0) return null;

  const taiexRow = indexTable.data.find(
    (row) => String(row[idxName] ?? '').trim() === '發行量加權股價指數',
  );
  if (!taiexRow) return null;

  const close = parseNumberOrZero(taiexRow[idxClose]);
  return close > 0 ? close : null;
};

/**
 * 由 MI_INDEX 回應中抽取「每日收盤行情(全部(不含權證、牛熊證))」資料列
 * @param raw TWSE MI_INDEX 回應
 * @returns 可供寫入 DB 的日行情陣列
 */
export const parseTwseMiIndexQuotes = (
  raw: TwseMiIndexResponse,
): TwseDailyQuote[] => {
  if (raw.stat !== 'OK' || !Array.isArray(raw.tables)) return [];

  const table = raw.tables.find((t) => {
    const fields = t.fields ?? [];
    return (
      fields.includes('證券代號') &&
      fields.includes('成交股數') &&
      fields.includes('開盤價') &&
      fields.includes('最高價') &&
      fields.includes('最低價') &&
      fields.includes('收盤價')
    );
  });
  if (!table?.fields?.length || !table.data?.length) return [];

  const idxCode = table.fields.indexOf('證券代號');
  const idxVolume = table.fields.indexOf('成交股數');
  const idxOpen = table.fields.indexOf('開盤價');
  const idxHigh = table.fields.indexOf('最高價');
  const idxLow = table.fields.indexOf('最低價');
  const idxClose = table.fields.indexOf('收盤價');

  if (
    [idxCode, idxVolume, idxOpen, idxHigh, idxLow, idxClose].some((x) => x < 0)
  ) {
    return [];
  }

  return table.data
    .map((row) => {
      const code = String(row[idxCode] ?? '').trim();
      const open = parseNumberOrZero(row[idxOpen]);
      const high = parseNumberOrZero(row[idxHigh]);
      const low = parseNumberOrZero(row[idxLow]);
      const close = parseNumberOrZero(row[idxClose]);
      const volume = parseVolumeOrZero(row[idxVolume]);
      return { code, open, high, low, close, volume };
    })
    .filter((q) => q.code.length > 0 && q.close > 0);
};

@Injectable()
export class StockPriceSyncService {
  private readonly logger = new Logger(StockPriceSyncService.name);
  /** 上市股票每日行情（可查歷史日期） */
  private readonly TWSE_URL =
    process.env.TWSE_MI_INDEX_URL?.trim() ||
    'https://www.twse.com.tw/rwd/zh/afterTrading/MI_INDEX';

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 格式化為 TWSE API 所需之 YYYYMMDD（以台北日曆為準）
   * @param date 參考時間
   * @returns YYYYMMDD
   */
  private readonly formatDateTwse = (date: Date): string => {
    const { y, m, day } = getYmdInTaipei(date);
    return `${y}${String(m).padStart(2, '0')}${String(day).padStart(2, '0')}`;
  };

  /**
   * 從 TWSE 取得指定日期 MI_INDEX 原始回應（單次，不含重試）
   * @param date 參考時間
   * @returns TWSE JSON
   */
  readonly fetchTwseMiIndex = async (
    date: Date,
  ): Promise<TwseMiIndexResponse> => {
    const dateStr = this.formatDateTwse(date);
    const url = `${this.TWSE_URL}?date=${dateStr}&type=ALLBUT0999&response=json`;
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; DividendHub/1.0; +https://github.com/) StockPriceSync',
      },
    });
    if (!res.ok) throw new Error(`TWSE API error: ${res.status}`);
    return res.json() as Promise<TwseMiIndexResponse>;
  };

  /**
   * 取得 MI_INDEX 並於失敗時指數退避重試
   * @param date 參考時間
   * @returns TWSE JSON
   */
  readonly fetchTwseMiIndexWithRetry = async (
    date: Date,
  ): Promise<TwseMiIndexResponse> => {
    let lastErr: unknown;
    for (let attempt = 0; attempt < TWSE_RETRY_MAX; attempt++) {
      try {
        return await this.fetchTwseMiIndex(date);
      } catch (err) {
        lastErr = err;
        const delay = TWSE_RETRY_BASE_MS * 2 ** attempt;
        this.logger.warn(
          `TWSE fetch retry ${attempt + 1}/${TWSE_RETRY_MAX} after ${delay}ms (${this.formatDateTwse(date)}): ${err}`,
        );
        await new Promise((r) => {
          setTimeout(r, delay);
        });
      }
    }
    throw lastErr;
  };

  /**
   * 同步指定台北日曆日之股價至 `StockPrice`（僅處理 DB 已存在之代號）
   * @param date 參考時間；非交易日或無資料時回傳 0 筆
   * @returns upsert 筆數
   */
  readonly syncDate = async (date: Date): Promise<number> => {
    const { y, m, day } = getYmdInTaipei(date);
    const dateOnly = calendarDateToUtcDate(y, m, day);

    let raw: TwseMiIndexResponse;
    try {
      raw = await this.fetchTwseMiIndexWithRetry(date);
    } catch (err) {
      this.logger.error(`TWSE fetch failed after retries: ${err}`);
      throw err;
    }

    const quotes = parseTwseMiIndexQuotes(raw);
    if (!quotes.length) {
      const purged = await this.prisma.stockPrice.deleteMany({
        where: { date: dateOnly },
      });
      this.logger.log(
        `TWSE: non-trading day or empty data for ${this.formatDateTwse(date)}, purged ${purged.count} stale rows and skipped`,
      );
      return 0;
    }

    const trackedCodes = new Set(
      (await this.prisma.stock.findMany({ select: { code: true } })).map(
        (s) => s.code,
      ),
    );

    let upserted = 0;
    for (const q of quotes) {
      if (!trackedCodes.has(q.code)) continue;
      try {
        await this.prisma.stockPrice.upsert({
          where: { stockCode_date: { stockCode: q.code, date: dateOnly } },
          create: {
            stockCode: q.code,
            date: dateOnly,
            open: q.open,
            high: q.high,
            low: q.low,
            close: q.close,
            volume: q.volume,
          },
          update: {
            open: q.open,
            high: q.high,
            low: q.low,
            close: q.close,
            volume: q.volume,
          },
        });
        upserted++;
      } catch (err) {
        this.logger.warn(`StockPrice upsert failed for ${q.code}: ${err}`);
      }
    }

    if (trackedCodes.has('TAIEX')) {
      const taiexClose = parseTwseMiIndexTaiex(raw);
      if (taiexClose !== null) {
        try {
          await this.prisma.stockPrice.upsert({
            where: { stockCode_date: { stockCode: 'TAIEX', date: dateOnly } },
            create: {
              stockCode: 'TAIEX',
              date: dateOnly,
              open: taiexClose,
              high: taiexClose,
              low: taiexClose,
              close: taiexClose,
              volume: 0n,
            },
            update: {
              open: taiexClose,
              high: taiexClose,
              low: taiexClose,
              close: taiexClose,
              volume: 0n,
            },
          });
          upserted++;
        } catch (err) {
          this.logger.warn(`StockPrice upsert failed for TAIEX: ${err}`);
        }
      }
    }

    return upserted;
  };
}
