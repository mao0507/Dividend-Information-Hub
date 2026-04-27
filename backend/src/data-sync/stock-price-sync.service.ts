import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

interface TwseResponse {
  stat: string
  date?: string
  data?: string[][]
}

@Injectable()
export class StockPriceSyncService {
  private readonly logger = new Logger(StockPriceSyncService.name)
  private readonly TWSE_URL = 'https://www.twse.com.tw/rwd/zh/afterTrading/STOCK_DAY_ALL'

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 格式化日期為 TWSE API 所需的 YYYYMMDD 格式
   * @param date 日期
   * @returns YYYYMMDD 格式字串
   */
  private readonly formatDate = (date: Date): string => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}${m}${d}`
  }

  /**
   * 移除千分位逗號並解析為浮點數
   * @param s 含千分位逗號的數字字串
   * @returns 浮點數，解析失敗回傳 0
   */
  private readonly parseNum = (s: string): number => {
    const n = parseFloat(s.replace(/,/g, ''))
    return isNaN(n) ? 0 : n
  }

  /**
   * 從 TWSE 取得指定日期所有上市股票的收盤資料
   * @param date 查詢日期
   * @returns TWSE API 原始回應
   */
  readonly fetchTwseDayAll = async (date: Date): Promise<TwseResponse> => {
    const dateStr = this.formatDate(date)
    const url = `${this.TWSE_URL}?date=${dateStr}&response=json`
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    if (!res.ok) throw new Error(`TWSE API error: ${res.status}`)
    return res.json() as Promise<TwseResponse>
  }

  /**
   * 同步指定日期的股價資料至 StockPrice 資料表
   * 只處理 DB 中已存在的股票代號；非交易日安全跳過
   * @param date 交易日
   * @returns upsert 筆數
   */
  readonly syncDate = async (date: Date): Promise<number> => {
    let raw: TwseResponse
    try {
      raw = await this.fetchTwseDayAll(date)
    } catch (err) {
      this.logger.error(`TWSE fetch failed: ${err}`)
      throw err
    }

    if (raw.stat !== 'OK' || !raw.data?.length) {
      this.logger.log(`TWSE: non-trading day or empty data for ${this.formatDate(date)}, skipping`)
      return 0
    }

    const trackedCodes = new Set(
      (await this.prisma.stock.findMany({ select: { code: true } })).map((s) => s.code),
    )

    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    let upserted = 0

    for (const row of raw.data) {
      if (!Array.isArray(row) || row.length < 9) continue
      const code = (row[0] ?? '').trim()
      if (!trackedCodes.has(code)) continue

      const open = this.parseNum(row[5] ?? '')
      const high = this.parseNum(row[6] ?? '')
      const low = this.parseNum(row[7] ?? '')
      const close = this.parseNum(row[8] ?? '')
      const volume = BigInt((row[2] ?? '').replace(/,/g, '') || '0')

      if (close <= 0) continue

      try {
        await this.prisma.stockPrice.upsert({
          where: { stockCode_date: { stockCode: code, date: dateOnly } },
          create: { stockCode: code, date: dateOnly, open, high, low, close, volume },
          update: { open, high, low, close, volume },
        })
        upserted++
      } catch (err) {
        this.logger.warn(`StockPrice upsert failed for ${code}: ${err}`)
      }
    }

    return upserted
  }
}
