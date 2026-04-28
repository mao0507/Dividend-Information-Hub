/**
 * 解析 `YYYY-MM-DD` 為 UTC 正午，避免時區造成日期前後偏移
 * @param ymd 日期字串
 * @returns UTC Date
 */
export const parseYmdUtcNoon = (ymd: string): Date => {
  const [y, m, d] = ymd.split('-').map((x) => parseInt(x, 10))
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0))
}

/**
 * 格式化為 `YYYY-MM-DD`
 * @param d UTC Date
 * @returns 日期字串
 */
export const formatUtcYmd = (d: Date): string => {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
