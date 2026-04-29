import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface FillTrackResult {
  checked: number;
  filled: number;
  skipped: number;
}

@Injectable()
export class DividendFillTrackerService {
  private readonly logger = new Logger(DividendFillTrackerService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 掃描所有尚未填息的 Dividend 紀錄，判斷是否已填息並更新 filled/fillDays
   * 只處理 filled=false、exDate<=今日、preExClose IS NOT NULL 的紀錄
   * @returns 已查核數、填息數、略過數
   */
  readonly track = async (): Promise<FillTrackResult> => {
    const today = new Date();

    const pendingDividends = await this.prisma.dividend.findMany({
      where: {
        filled: false,
        preExClose: { not: null },
        exDate: { lte: today },
      },
      select: {
        id: true,
        stockCode: true,
        exDate: true,
        preExClose: true,
      },
    });

    let filledCount = 0;
    let skippedCount = 0;

    for (const div of pendingDividends) {
      if (div.preExClose === null || div.exDate === null) {
        this.logger.log(
          `FillTracker: ${div.stockCode} exDate=${div.exDate?.toISOString() ?? 'null'} — preExClose 缺失，略過`,
        );
        skippedCount++;
        continue;
      }

      const wasFilled = await this.checkAndUpdateFill(
        div.id,
        div.stockCode,
        div.exDate,
        div.preExClose,
      );

      if (wasFilled) filledCount++;
    }

    this.logger.log(
      `FillTracker: 查核 ${pendingDividends.length} 筆，填息 ${filledCount} 筆，略過 ${skippedCount} 筆`,
    );

    await this.batchRecalculateEarnedDividend();

    return {
      checked: pendingDividends.length,
      filled: filledCount,
      skipped: skippedCount,
    };
  };

  /**
   * 以單一 JOIN SQL 批量重算所有 Holding.earnedDividend。
   * 在 DividendFillTracker 每日跑完後觸發，確保 filled 狀態更新後快取同步。
   */
  readonly batchRecalculateEarnedDividend = async (): Promise<void> => {
    await this.prisma.$executeRaw`
      UPDATE "Holding" h
      SET "earnedDividend" = (
        SELECT COALESCE(SUM(d.cash * l."buyQuantity"), 0)
        FROM "HoldingLot" l
        JOIN "Dividend" d ON d."stockCode" = l."stockCode"
        WHERE d.filled = TRUE
          AND d."payDate" IS NOT NULL
          AND d."payDate" >= l."buyTimestamp"
          AND l."userId" = h."userId"
          AND l."stockCode" = h."stockCode"
      )
    `;
    this.logger.log('FillTracker: Holding.earnedDividend batch 重算完成');
  };

  /**
   * 對單一 Dividend 查詢 StockPrice 是否已出現 close >= preExClose，
   * 計算 fillDays 並寫入 DB；回傳是否已填息
   * @param dividendId Dividend 主鍵
   * @param stockCode 股票代號
   * @param exDate 除息日
   * @param preExClose 除息前收盤價
   * @returns 是否填息
   */
  readonly checkAndUpdateFill = async (
    dividendId: string,
    stockCode: string,
    exDate: Date,
    preExClose: number,
  ): Promise<boolean> => {
    const pricesAfterEx = await this.prisma.stockPrice.findMany({
      where: {
        stockCode,
        date: { gt: exDate },
      },
      orderBy: { date: 'asc' },
      select: { date: true, close: true },
    });

    if (pricesAfterEx.length === 0) return false;

    let fillDays: number | null = null;
    for (let i = 0; i < pricesAfterEx.length; i++) {
      if (pricesAfterEx[i].close >= preExClose) {
        fillDays = i + 1;
        break;
      }
    }

    if (fillDays === null) return false;

    await this.prisma.dividend.update({
      where: { id: dividendId },
      data: { filled: true, fillDays },
    });

    return true;
  };
}
