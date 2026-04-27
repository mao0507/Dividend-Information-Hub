import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../prisma/prisma.service'
import { DividendRecord, DividendSource } from './dividend-source.interface'
import { TwseDividendSource } from './twse-dividend.source'
import { FinMindDividendSource } from './finmind-dividend.source'

export interface SyncAllResult {
  total: number
  failed: string[]
}

@Injectable()
export class DividendSyncService {
  private readonly logger = new Logger(DividendSyncService.name)

  /**
   * 資料源清單，依優先順序排列（前者優先）
   * FinMind 設有 token 時排在最前；無論如何 TWSE 作為最終 fallback
   */
  private readonly sources: DividendSource[]

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    const finmindToken = this.config.get<string>('FINMIND_TOKEN') ?? ''
    this.sources = finmindToken
      ? [new FinMindDividendSource(finmindToken), new TwseDividendSource()]
      : [new TwseDividendSource()]
  }

  /**
   * 將 DividendRecord 陣列 upsert 進 Dividend 資料表
   * 以 exDate ±7 天範圍比對現有紀錄；有則更新，無則新增（period 自動遞增）
   * 不覆蓋 filled / fillDays 欄位
   * @param records 待寫入的配息紀錄
   * @returns upsert 筆數
   */
  readonly upsertRecords = async (records: DividendRecord[]): Promise<number> => {
    let upserted = 0
    for (const rec of records) {
      if (!rec.exDate) continue
      const { stockCode, year, cash, exDate, payDate, freq } = rec
      try {
        const existing = await this.prisma.dividend.findFirst({
          where: {
            stockCode,
            year,
            exDate: {
              gte: new Date(exDate.getTime() - 7 * 86_400_000),
              lte: new Date(exDate.getTime() + 7 * 86_400_000),
            },
          },
        })

        if (existing) {
          await this.prisma.dividend.update({
            where: { id: existing.id },
            data: { cash, exDate, ...(payDate !== undefined ? { payDate } : {}) },
          })
        } else {
          const maxPeriodRow = await this.prisma.dividend.findFirst({
            where: { stockCode, year },
            orderBy: { period: 'desc' },
            select: { period: true },
          })
          const period = (maxPeriodRow?.period ?? 0) + 1
          await this.prisma.dividend.create({
            data: {
              stockCode,
              year,
              period,
              freq: freq ?? 'annual',
              cash,
              exDate,
              ...(payDate !== undefined ? { payDate } : {}),
            },
          })
        }
        upserted++
      } catch (err) {
        this.logger.warn(`Dividend upsert failed for ${stockCode} exDate ${exDate.toISOString()}: ${err}`)
      }
    }
    return upserted
  }

  /**
   * 對外統一入口：依 sources 優先順序嘗試同步，失敗時自動 fallback 至下一個資料源
   * @returns 總 upsert 筆數與失敗清單
   */
  readonly syncAll = async (): Promise<SyncAllResult> => {
    const trackedCodes = new Set(
      (await this.prisma.stock.findMany({ select: { code: true } })).map((s) => s.code),
    )

    const failed: string[] = []
    for (const source of this.sources) {
      try {
        this.logger.log(`Trying dividend source: ${source.name}`)
        const records = await source.sync(trackedCodes)
        const total = await this.upsertRecords(records)
        this.logger.log(`Dividend source ${source.name} succeeded: ${total} rows`)
        return { total, failed }
      } catch (err) {
        this.logger.warn(`Dividend source ${source.name} failed: ${err}`)
        failed.push(source.name)
      }
    }

    this.logger.error('All dividend sources failed')
    return { total: 0, failed }
  }
}
