import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../prisma/prisma.service'
import { FinMindClient } from './finmind-client'

export interface PayDateSyncResult {
  fetched: number
  updated: number
  rateLimited: boolean
}

@Injectable()
export class FinMindPayDateSyncService {
  private readonly logger = new Logger(FinMindPayDateSyncService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly finMindClient: FinMindClient,
  ) {}

  /**
   * 從 FinMind TaiwanStockDividend 批次回填 payDate 至現有 Dividend 記錄
   * 僅查詢 DB 中 payDate IS NULL 的股票，每筆請求間隔 250ms
   * 遇到 402 rate limit 時優雅停止並回傳目前進度
   * @returns 取得筆數、更新筆數、是否中途遇到 rate limit
   */
  readonly syncPayDates = async (): Promise<PayDateSyncResult> => {
    const token = this.config.get<string>('FINMIND_TOKEN')
    if (!token) throw new Error('FINMIND_TOKEN not configured')

    const startDate = new Date()
    startDate.setFullYear(startDate.getFullYear() - 2)
    const startDateStr = startDate.toISOString().slice(0, 10)

    // 只取 payDate 為 null 的股票，減少不必要的 API 請求
    const codesWithNullPay = await this.prisma.dividend.findMany({
      where: {
        payDate: null,
        exDate: { gte: startDate },
      },
      select: { stockCode: true },
      distinct: ['stockCode'],
    })

    const codes = codesWithNullPay.map((r) => r.stockCode)
    this.logger.log(`FinMindPayDateSync: ${codes.length} 個股票待補 payDate`)

    const windowMs = 7 * 86_400_000
    let fetched = 0
    let updated = 0
    let rateLimited = false

    for (const code of codes) {
      let body: Awaited<ReturnType<typeof this.finMindClient.fetchDividendData>>
      try {
        body = await this.finMindClient.fetchDividendData({ code, startDate: startDateStr, token })
      } catch (err) {
        this.finMindClient.logFetchError(code, err)
        continue
      }

      if (this.finMindClient.isRateLimited(body)) {
        this.logger.warn('FinMindPayDateSync: 遇到 rate limit (402)，中止')
        rateLimited = true
        break
      }

      if (body.status !== 200 || !body.data?.length) continue

      fetched += body.data.length

      for (const item of body.data) {
        const rawPay = item.CashDividendPaymentDate
        const rawEx = item.CashExDividendTradingDate
        if (!rawPay || rawPay === '0' || !rawEx || rawEx === '0') continue

        const payDate = new Date(rawPay)
        const exDate = new Date(rawEx)
        if (isNaN(payDate.getTime()) || isNaN(exDate.getTime())) continue

        const existing = await this.prisma.dividend.findFirst({
          where: {
            stockCode: code,
            exDate: {
              gte: new Date(exDate.getTime() - windowMs),
              lte: new Date(exDate.getTime() + windowMs),
            },
            payDate: null,
          },
        })

        if (existing) {
          await this.prisma.dividend.update({
            where: { id: existing.id },
            data: { payDate },
          })
          updated++
        }
      }
    }

    this.logger.log(
      `FinMindPayDateSync: 完成，取得 ${fetched} 筆，更新 ${updated} 筆，rateLimited=${rateLimited}`,
    )
    return { fetched, updated, rateLimited }
  }
}
