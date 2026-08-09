import { Injectable, Logger } from '@nestjs/common'

/** FinMind TaiwanStockDividend 單筆資料 */
export interface FinMindDividendItem {
  stock_id: string
  date?: string
  CashEarningsDistribution: number // 盈餘配息
  CashExDividendTradingDate: string // 除息交易日
  CashDividendPaymentDate: string // 現金股利發放日
}

/** FinMind API 回應格式 */
export interface FinMindResponse {
  status: number
  msg: string
  data?: FinMindDividendItem[]
}

/** fetchDividendData 呼叫參數 */
export interface FetchDividendDataParams {
  /** 股票代號 */
  code: string
  /** 起始日期（YYYY-MM-DD） */
  startDate: string
  /** FinMind API token */
  token: string
}

const BASE_URL = 'https://api.finmindtrade.com/api/v4/data'
/** 呼叫間節流間隔，避免觸發 FinMind rate limit */
const THROTTLE_MS = 250
/** FinMind 回應 status：達到方案配額上限 */
const RATE_LIMIT_STATUS = 402

/**
 * 延遲指定毫秒數
 * @param ms 毫秒數
 * @returns 延遲完成的 Promise
 */
const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * 共用 FinMind API 客戶端
 * 內建請求節流（250ms）與 402 rate limit 判斷，供各 data-sync 服務注入使用
 */
@Injectable()
export class FinMindClient {
  private readonly logger = new Logger(FinMindClient.name)

  /**
   * 呼叫 FinMind TaiwanStockDividend 資料集（自動節流 250ms）
   * @param params 股票代號、起始日期、token
   * @returns FinMind 回應
   */
  readonly fetchDividendData = async (
    params: FetchDividendDataParams,
  ): Promise<FinMindResponse> => {
    await sleep(THROTTLE_MS)

    const url =
      `${BASE_URL}?dataset=TaiwanStockDividend` +
      `&data_id=${params.code}&start_date=${params.startDate}&token=${params.token}`

    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    return (await res.json()) as FinMindResponse
  }

  /**
   * 判斷 FinMind 回應是否為 402 rate limit
   * @param res FinMind 回應
   * @returns 是否為 rate limit
   */
  readonly isRateLimited = (res: FinMindResponse): boolean => res.status === RATE_LIMIT_STATUS

  /**
   * 記錄網路層級錯誤（供呼叫端在 catch 區塊使用，統一日誌格式）
   * @param code 股票代號
   * @param err 錯誤內容
   */
  readonly logFetchError = (code: string, err: unknown): void => {
    this.logger.warn(`FinMindClient: 網路錯誤 ${code} — ${err}`)
  }
}
