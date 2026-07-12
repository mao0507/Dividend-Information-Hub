import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../prisma/prisma.service'

interface FinMindDividendItem {
  stock_id: string
  CashExDividendTradingDate: string   // 除息交易日
  CashDividendPaymentDate: string     // 現金股利發放日
  CashEarningsDistribution: number   // 盈餘配息
}

interface FinMindResponse {
  status: number
  msg: string
  data?: FinMindDividendItem[]
}

export interface PayDateSyncResult {
  fetched: number
  updated: number
  rateLimited: boolean
}

const DELAY_MS = 250
const BASE_URL = 'https://api.finmindtrade.com/api/v4/data'

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

@Injectable()
export class FinMindPayDateSyncService {
  private readonly logger = new Logger(FinMindPayDateSyncService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
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
      await sleep(DELAY_MS)

      const url =
        `${BASE_URL}?dataset=TaiwanStockDividend` +
        `&data_id=${code}&start_date=${startDateStr}&token=${token}`

      let body: FinMindResponse
      try {
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
        body = (await res.json()) as FinMindResponse
      } catch (err) {
        this.logger.warn(`FinMindPayDateSync: 網路錯誤 ${code} — ${err}`)
        continue
      }

      if (body.status === 402) {
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
