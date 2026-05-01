import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

const TWSE_TWT48U = 'https://www.twse.com.tw/rwd/zh/exRight/TWT48U'
const UA = 'Mozilla/5.0 (compatible; DividendHub/1.0) AnnouncementSync'

type Twt48uResponse = {
  stat: string
  data?: string[][]
}

/**
 * 將民國年日期字串轉換為 Date（UTC 午夜）
 * @param rocStr 民國年格式字串，例如 "115年05月15日"
 * @returns Date 或 null
 */
const parseRocDate = (rocStr: string): Date | null => {
  const m = rocStr.match(/(\d+)年(\d+)月(\d+)日/)
  if (!m) return null
  const year = parseInt(m[1], 10) + 1911
  const month = parseInt(m[2], 10) - 1
  const day = parseInt(m[3], 10)
  return new Date(Date.UTC(year, month, day))
}

/**
 * 格式化 Date 為 YYYYMMDD（UTC 日曆）
 * @param d Date
 * @returns YYYYMMDD 字串
 */
const toYyyymmdd = (d: Date): string => {
  const y = d.getUTCFullYear()
  const mo = String(d.getUTCMonth() + 1).padStart(2, '0')
  const dy = String(d.getUTCDate()).padStart(2, '0')
  return `${y}${mo}${dy}`
}

/**
 * 根據年度配息次數推算配息頻率
 * @param yearlyCount 同年度配息筆數
 * @returns freq 字串
 */
export const inferFreq = (yearlyCount: number): string => {
  if (yearlyCount >= 10) return 'monthly'
  if (yearlyCount >= 3) return 'quarterly'
  if (yearlyCount >= 2) return 'semi-annual'
  return 'annual'
}

@Injectable()
export class TwseDividendAnnouncementSyncService {
  private readonly logger = new Logger(TwseDividendAnnouncementSyncService.name)

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 查詢 TWSE TWT48U 取得未來已公告除息日期並 upsert 至 Dividend 資料表
   * @param lookAheadDays 往後查詢天數（預設 90）
   * @returns upsert 筆數
   */
  readonly sync = async (lookAheadDays = 90): Promise<number> => {
    const startDate = new Date()
    const endDate = new Date(startDate.getTime() + lookAheadDays * 86_400_000)

    const startStr = toYyyymmdd(startDate)
    const endStr = toYyyymmdd(endDate)
    const url = `${TWSE_TWT48U}?startDate=${startStr}&endDate=${endStr}&response=json`

    this.logger.log(`AnnouncementSync: TWT48U 查詢 ${startStr}~${endStr}`)

    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA } })
      if (!res.ok) throw new Error(`TWT48U HTTP ${res.status}`)

      const raw = (await res.json()) as Twt48uResponse
      if (raw.stat !== 'OK' || !raw.data?.length) {
        this.logger.log('AnnouncementSync: 無公告資料，跳過')
        return 0
      }

      const trackedCodes = new Set(
        (await this.prisma.stock.findMany({ select: { code: true } })).map(
          (s) => s.code,
        ),
      )

      const total = await this.upsertRows(raw.data, trackedCodes)
      this.logger.log(`AnnouncementSync: 完成，upsert ${total} 筆`)
      return total
    } catch (err) {
      this.logger.error(`AnnouncementSync: TWT48U 失敗 — ${err}`)
      return 0
    }
  }

  /**
   * 解析 TWT48U data 列並 upsert 至 Dividend 資料表
   * TWT48U 欄位：row[0]=除息日、row[1]=代號、row[3]=除權息類型、row[7]=現金股利
   * （注意：欄位佈局與 TWT49U 不同，現金股利在 row[7]，類型在 row[3]）
   * @param rows TWT48U 回應的 data 陣列
   * @param trackedCodes 已追蹤股票代號集合
   * @returns upsert 筆數
   */
  readonly upsertRows = async (
    rows: string[][],
    trackedCodes: Set<string>,
  ): Promise<number> => {
    let upserted = 0
    for (const row of rows) {
      // 欄位 guard：任一關鍵欄位缺失則略過
      if (!row[0] || !row[1] || !row[3]) {
        this.logger.warn(`AnnouncementSync: 欄位缺失，略過 row=${JSON.stringify(row)}`)
        continue
      }

      const code = String(row[1]).trim()
      if (!trackedCodes.has(code)) continue

      // row[3] = 除權息類型（"息" / "權" / "權息"）
      const type = String(row[3]).trim()
      if (!type.includes('息')) continue

      const exDate = parseRocDate(String(row[0]))
      if (!exDate) {
        this.logger.warn(`AnnouncementSync: 日期解析失敗 row[0]=${row[0]}`)
        continue
      }

      // row[7] = 現金股利；"待公告實際收益分配金額" 存入 cash=0（前端顯示「尚未公布」）
      const rawCash = String(row[7] ?? '').replace(/,/g, '').replace(/<[^>]+>/g, '').trim()
      const isPending = rawCash.includes('待公告')
      if (!isPending && rawCash === '') continue  // 完全無現金配息，跳過
      const cash = isPending ? 0 : (parseFloat(rawCash) || 0)
      if (!isPending && cash <= 0) continue  // 非待公告但金額為 0，跳過

      try {
        const windowMs = 7 * 86_400_000
        const existing = await this.prisma.dividend.findFirst({
          where: {
            stockCode: code,
            exDate: {
              gte: new Date(exDate.getTime() - windowMs),
              lte: new Date(exDate.getTime() + windowMs),
            },
          },
        })

        if (existing) {
          await this.prisma.dividend.update({
            where: { id: existing.id },
            data: { cash, exDate },
          })
        } else {
          const maxPeriodRow = await this.prisma.dividend.findFirst({
            where: { stockCode: code, year: exDate.getUTCFullYear() },
            orderBy: { period: 'desc' },
            select: { period: true },
          })
          const period = (maxPeriodRow?.period ?? 0) + 1
          await this.prisma.dividend.create({
            data: {
              stockCode: code,
              year: exDate.getUTCFullYear(),
              period,
              freq: inferFreq(period),
              cash,
              exDate,
            },
          })
        }
        upserted++
      } catch (err) {
        this.logger.warn(
          `AnnouncementSync: upsert ${code} exDate ${exDate.toISOString()} 失敗 — ${err}`,
        )
      }
    }
    return upserted
  }
}
