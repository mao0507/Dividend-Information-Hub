import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  parseTwseMiIndexQuotes,
  StockPriceSyncService,
} from './stock-price-sync.service';
import { formatUtcYmd, parseYmdUtcNoon } from './stock-date.util';

/** 價格比對狀態 */
export type StockPriceValidationStatus =
  | 'MATCH'
  | 'NOT_TRADING_DAY'
  | 'MISSING_IN_DB'
  | 'MISSING_IN_SOURCE'
  | 'VALUE_MISMATCH'
  | 'PARSE_ERROR';

/** 單點股價驗證回傳 */
export type StockPriceValidationResult = {
  stockCode: string;
  normalizedDate: string;
  isTradingDay: boolean;
  status: StockPriceValidationStatus;
  reason: string;
  dbClose: number | null;
  sourceClose: number | null;
  sourceFetchAt: string;
};

/**
 * 安全解析數字字串（非數字回傳 null）
 * @param raw 原始字串
 * @returns 數字或 null
 */
const parseNumberOrNull = (raw: string | undefined): number | null => {
  const n = Number.parseFloat(
    String(raw ?? '')
      .replace(/,/g, '')
      .trim(),
  );
  return Number.isFinite(n) ? n : null;
};

/**
 * 單點價格資料驗證（DB vs TWSE）
 */
@Injectable()
export class StockPriceValidationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly priceSync: StockPriceSyncService,
  ) {}

  /**
   * 驗證單點股價是否與 TWSE 一致
   * @param stockCode 股票代號
   * @param dateYmd 查詢日期（YYYY-MM-DD）
   * @returns 驗證結果
   */
  readonly validateOne = async (
    stockCode: string,
    dateYmd: string,
  ): Promise<StockPriceValidationResult> => {
    const normalizedCode = stockCode.trim();
    const normalizedDate = formatUtcYmd(parseYmdUtcNoon(dateYmd));
    const sourceFetchAt = new Date().toISOString();

    const raw = await this.priceSync.fetchTwseMiIndexWithRetry(
      parseYmdUtcNoon(normalizedDate),
    );
    const quotes = parseTwseMiIndexQuotes(raw);

    const sourceTable = raw.tables?.find((t) => {
      const fields = t.fields ?? [];
      return fields.includes('證券代號') && fields.includes('收盤價');
    });
    const idxCode = sourceTable?.fields?.indexOf('證券代號') ?? -1;
    const idxClose = sourceTable?.fields?.indexOf('收盤價') ?? -1;
    const rawRow =
      idxCode >= 0
        ? sourceTable?.data?.find(
            (row) => String(row[idxCode] ?? '').trim() === normalizedCode,
          )
        : undefined;

    if (rawRow && idxClose >= 0) {
      const close = parseNumberOrNull(rawRow[idxClose]);
      if (close === null || close <= 0) {
        return {
          stockCode: normalizedCode,
          normalizedDate,
          isTradingDay: true,
          status: 'PARSE_ERROR',
          reason: 'TWSE 收盤價欄位解析失敗',
          dbClose: null,
          sourceClose: null,
          sourceFetchAt,
        };
      }
    }

    if (!quotes.length) {
      return {
        stockCode: normalizedCode,
        normalizedDate,
        isTradingDay: false,
        status: 'NOT_TRADING_DAY',
        reason: '查詢日無 TWSE 成交資料（可能為休市日）',
        dbClose: null,
        sourceClose: null,
        sourceFetchAt,
      };
    }

    const source = quotes.find((q) => q.code === normalizedCode);
    if (!source) {
      return {
        stockCode: normalizedCode,
        normalizedDate,
        isTradingDay: true,
        status: 'MISSING_IN_SOURCE',
        reason: 'TWSE 當日成交資料中無此代號',
        dbClose: null,
        sourceClose: null,
        sourceFetchAt,
      };
    }

    if (!Number.isFinite(source.close) || source.close <= 0) {
      return {
        stockCode: normalizedCode,
        normalizedDate,
        isTradingDay: true,
        status: 'PARSE_ERROR',
        reason: 'TWSE 收盤價欄位解析失敗',
        dbClose: null,
        sourceClose: null,
        sourceFetchAt,
      };
    }

    const dateOnly = parseYmdUtcNoon(normalizedDate);
    const db = await this.prisma.stockPrice.findUnique({
      where: {
        stockCode_date: {
          stockCode: normalizedCode,
          date: dateOnly,
        },
      },
      select: { close: true },
    });

    if (!db) {
      return {
        stockCode: normalizedCode,
        normalizedDate,
        isTradingDay: true,
        status: 'MISSING_IN_DB',
        reason: 'DB 無對應日線資料',
        dbClose: null,
        sourceClose: source.close,
        sourceFetchAt,
      };
    }

    if (Math.abs(db.close - source.close) < 1e-9) {
      return {
        stockCode: normalizedCode,
        normalizedDate,
        isTradingDay: true,
        status: 'MATCH',
        reason: 'DB 與 TWSE 收盤價一致',
        dbClose: db.close,
        sourceClose: source.close,
        sourceFetchAt,
      };
    }

    return {
      stockCode: normalizedCode,
      normalizedDate,
      isTradingDay: true,
      status: 'VALUE_MISMATCH',
      reason: 'DB 與 TWSE 收盤價不一致',
      dbClose: db.close,
      sourceClose: source.close,
      sourceFetchAt,
    };
  };
}
