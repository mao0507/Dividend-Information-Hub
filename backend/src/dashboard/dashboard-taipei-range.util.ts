/**
 * Dashboard 用台北日曆邊界（週一～週日、當日全日）。
 * 股息 `exDate` 寫入多為「日曆日」瞬時（如 TWSE `new Date(y,m,d)` 於同步主機本地、或 UTC 正午），
 * 查詢以 +08 整日包絡比對，與使用者認知之除息日一致。
 */
const TPE = 'Asia/Taipei' as const

/**
 * 將數字補成兩位字串（月／日）
 * @param n 整數
 * @returns 兩位字串
 */
const pad2 = (n: number): string => String(n).padStart(2, '0')

/** en-US weekday short 對應「週一為一週起點」之偏移天數 */
const OFFSET_FROM_MONDAY: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
}

/**
 * 將西元曆年月日轉為台北當日 00:00:00.000（+08）之瞬時
 * @param y 西元年
 * @param m 月（1–12）
 * @param d 日
 * @returns Date（絕對時間戳）
 */
const parseTaipeiStartOfDay = (y: number, m: number, d: number): Date =>
  new Date(`${y}-${pad2(m)}-${pad2(d)}T00:00:00.000+08:00`)

/**
 * 將西元曆年月日轉為台北當日 23:59:59.999（+08）之瞬時
 * @param y 西元年
 * @param m 月（1–12）
 * @param d 日
 * @returns Date（絕對時間戳）
 */
const parseTaipeiEndOfDay = (y: number, m: number, d: number): Date =>
  new Date(`${y}-${pad2(m)}-${pad2(d)}T23:59:59.999+08:00`)

/**
 * 取得某瞬時在 Asia/Taipei 的日曆年月日（與伺服器本地時區無關）
 * @param instant 參考時間
 * @returns 台北日曆之 y/m/d
 */
export const getTaipeiYmdFromInstant = (
  instant: Date,
): { y: number; m: number; d: number } => {
  const s = new Intl.DateTimeFormat('en-CA', {
    timeZone: TPE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(instant)
  const [y, m, d] = s.split('-').map((part) => parseInt(part, 10))
  return { y, m, d }
}

/**
 * 在台北日曆上加減整數天（以正午 +08 錨定，台灣無日光節省時間）
 * @param y 西元年
 * @param m 月（1–12）
 * @param d 日
 * @param deltaDays 要加的天數（可為負）
 * @returns 加減後之台北日曆 y/m/d
 */
export const addTaipeiCalendarDays = (
  y: number,
  m: number,
  d: number,
  deltaDays: number,
): { y: number; m: number; d: number } => {
  const base = new Date(`${y}-${pad2(m)}-${pad2(d)}T12:00:00+08:00`)
  const shifted = new Date(base.getTime() + deltaDays * 86_400_000)
  return getTaipeiYmdFromInstant(shifted)
}

/**
 * 取得某瞬時在台北之「週一」偏移（週一=0 … 週日=6）
 * @param instant 參考時間
 * @returns 與本週一相差之天數（週一為 0）
 */
export const getTaipeiWeekdayOffsetFromMonday = (instant: Date): number => {
  const wd = new Intl.DateTimeFormat('en-US', {
    timeZone: TPE,
    weekday: 'short',
  }).format(instant)
  return OFFSET_FROM_MONDAY[wd] ?? 0
}

/**
 * 取得台北日曆週範圍：週一 00:00:00.000 ～ 週日 23:59:59.999（+08）
 * @param instant 參考「現在」
 * @returns weekStart、weekEnd 供 Prisma `gte` / `lte` 使用
 */
export const getTaipeiCalendarWeekRange = (
  instant: Date,
): { weekStart: Date; weekEnd: Date } => {
  const { y, m, d } = getTaipeiYmdFromInstant(instant)
  const offset = getTaipeiWeekdayOffsetFromMonday(instant)
  const mon = addTaipeiCalendarDays(y, m, d, -offset)
  const sun = addTaipeiCalendarDays(mon.y, mon.m, mon.d, 6)
  return {
    weekStart: parseTaipeiStartOfDay(mon.y, mon.m, mon.d),
    weekEnd: parseTaipeiEndOfDay(sun.y, sun.m, sun.d),
  }
}

/**
 * 取得台北「當日」起訖：該日 00:00:00.000 ～ 23:59:59.999（+08）
 * @param instant 參考時間（取其所在台北日曆日）
 * @returns dayStart、dayEnd
 */
export const getTaipeiCalendarDayRange = (
  instant: Date,
): { dayStart: Date; dayEnd: Date } => {
  const { y, m, d } = getTaipeiYmdFromInstant(instant)
  return {
    dayStart: parseTaipeiStartOfDay(y, m, d),
    dayEnd: parseTaipeiEndOfDay(y, m, d),
  }
}
