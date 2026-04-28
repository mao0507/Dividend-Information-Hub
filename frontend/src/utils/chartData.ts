import type { OhlcvPoint } from '@/types'

/** 圖表資料正規化後的對外狀態（不含載入中，載入由元件另列 prop） */
export type ChartDisplayStatus = 'ready' | 'empty' | 'error'

/** 正規化結果：可渲染、空資料或錯誤 */
export type NormalizeChartDataResult =
  | { kind: 'ready'; candles: OhlcvPoint[] }
  | { kind: 'empty' }
  | { kind: 'error'; reason: string }

export type NormalizeChartDataOptions = {
  closedDates?: ReadonlySet<string>
}

const REQUIRED_KEYS = ['date', 'open', 'high', 'low', 'close', 'volume'] as const

/**
 * 判斷日期是否為台股可能交易日（先排除週末）
 * @param dayKey YYYY-MM-DD
 * @returns 週一到週五為 true
 */
const isWeekdayTradingDate = (dayKey: string): boolean => {
  const ms = Date.parse(`${dayKey}T00:00:00.000Z`)
  if (!Number.isFinite(ms)) return false
  const day = new Date(ms).getUTCDay()
  return day >= 1 && day <= 5
}

/**
 * 將 API 日期（ISO 或 YYYY-MM-DD）轉成日線圖用之 YYYY-MM-DD，供 lightweight-charts 使用
 * @param raw 原始日期欄位
 * @returns YYYY-MM-DD 或無法解析時為 null
 */
export const toChartDayKey = (raw: unknown): string | null => {
  if (typeof raw !== 'string') return null
  const s = raw.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  const ms = Date.parse(s)
  if (!Number.isFinite(ms)) return null
  const localDay = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(ms))
  return localDay
}

/**
 * 驗證單筆原始物件是否具備合法 OHLCV 欄位
 * @param row 單筆未知資料
 * @returns 合法則回傳 OhlcvPoint，否則 null
 */
const parseOhlcvRow = (row: unknown): OhlcvPoint | null => {
  if (!row || typeof row !== 'object') return null
  const r = row as Record<string, unknown>
  for (const k of REQUIRED_KEYS) {
    if (!(k in r)) return null
  }
  const date = toChartDayKey(r.date)
  if (!date) return null
  if (!isWeekdayTradingDate(date)) return null
  const open = Number(r.open)
  const high = Number(r.high)
  const low = Number(r.low)
  const close = Number(r.close)
  const volume = Number(r.volume)
  if (
    !Number.isFinite(open)
    || !Number.isFinite(high)
    || !Number.isFinite(low)
    || !Number.isFinite(close)
    || !Number.isFinite(volume)
    || close <= 0
  ) {
    return null
  }
  return { date, open, high, low, close, volume }
}

/**
 * 驗證單筆原始物件是否具備合法 OHLCV 欄位，並排除指定休市日
 * @param row 單筆未知資料
 * @param closedDates TWSE 休市日期集合
 * @returns 合法則回傳 OhlcvPoint，否則 null
 */
const parseOhlcvRowWithClosedDates = (
  row: unknown,
  closedDates: ReadonlySet<string>,
): OhlcvPoint | null => {
  const parsed = parseOhlcvRow(row)
  if (!parsed) return null
  if (closedDates.has(parsed.date)) return null
  return parsed
}

/**
 * 同一日僅保留最後一筆（API 若重複送同日多筆時避免繪圖異常）
 * @param rows 已排序之 OHLCV 列
 * @returns 依日期去重後之列
 */
const dedupeByDate = (rows: OhlcvPoint[]): OhlcvPoint[] => {
  const map = new Map<string, OhlcvPoint>()
  for (const row of rows) {
    map.set(row.date, row)
  }
  return [...map.values()].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
}

/**
 * 將 API 或未知來源資料正規化為圖表可用格式，並區分可渲染 / 空 / 錯誤
 * @param raw 原始資料（預期為 OhlcvPoint 陣列）
 * @returns 正規化結果
 */
export const normalizeChartData = (
  raw: unknown,
  options: NormalizeChartDataOptions = {},
): NormalizeChartDataResult => {
  if (!Array.isArray(raw)) {
    return { kind: 'error', reason: '資料格式不正確' }
  }
  if (raw.length === 0) {
    return { kind: 'empty' }
  }

  const parsed: OhlcvPoint[] = []
  const closedDates = options.closedDates ?? new Set<string>()
  for (const row of raw) {
    const pt = parseOhlcvRowWithClosedDates(row, closedDates)
    if (pt) parsed.push(pt)
  }

  if (parsed.length === 0) {
    return { kind: 'empty' }
  }

  const sorted = dedupeByDate(parsed)
  return { kind: 'ready', candles: sorted }
}
