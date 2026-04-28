import type { DashboardSummary } from '@/types'

export type DashboardCardState = 'ready' | 'empty' | 'stale' | 'error'

export interface DashboardTopCard {
  key: 'todayExDiv' | 'weekExDiv' | 'pendingFill' | 'nextPayout'
  title: string
  label: string
  displayValue: number | string
  value: number | string
  unit: string
  sub: string
  iconName: 'bolt' | 'calendar' | 'clock' | 'banknotes'
  accent: string
  state: DashboardCardState
  asOf: string | null
}

export interface BuildDashboardTopCardsOptions {
  summary: DashboardSummary | null
  asOf: string | null
  hasError: boolean
}

/**
 * 將數值格式化為卡片顯示值；缺值一律回傳中性佔位。
 * @param value 原始數值
 * @returns 顯示值
 */
const normalizeValue = (value: number | null | undefined): number | string =>
  Number.isFinite(value) ? Number(value) : '--'

/**
 * 將日期字串格式化為可讀日期，避免直接顯示 ISO 原始字串。
 * @param raw 原始日期字串
 * @returns 可讀日期或中性占位
 */
const formatReadableDate = (raw: string | null | undefined): string => {
  if (!raw) return '—'
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

/**
 * 依載入狀態推導卡片狀態。
 * @param summary 儀表板摘要
 * @param asOf 共用資料時間
 * @param hasError 是否載入失敗
 * @returns 卡片狀態
 */
const resolveState = (
  summary: DashboardSummary | null,
  asOf: string | null,
  hasError: boolean,
): DashboardCardState => {
  if (hasError) return 'error'
  if (!summary) return 'empty'
  if (!asOf) return 'stale'
  return 'ready'
}

/**
 * 建立 Dashboard 上方四卡資料模型。
 * @param options 輸入資料
 * @returns 四卡資料
 */
export const buildDashboardTopCards = (
  options: BuildDashboardTopCardsOptions,
): DashboardTopCard[] => {
  const { summary, asOf, hasError } = options
  const state = resolveState(summary, asOf, hasError)
  const suffix =
    state === 'ready'
      ? asOf
        ? `資料時間 ${asOf}`
        : '資料時間未知'
      : state === 'error'
        ? '資料讀取失敗'
        : state === 'stale'
          ? '資料同步中'
          : '暫無資料'
  const buildValue = (raw: number | null | undefined): number | string =>
    state === 'ready' ? normalizeValue(raw) : '--'

  return [
    {
      key: 'todayExDiv',
      title: '今日除息',
      label: '今日除息',
      displayValue: buildValue(summary?.todayExDiv.count),
      value: buildValue(summary?.todayExDiv.count),
      unit: '檔',
      sub:
        state === 'ready'
          ? summary?.todayExDiv.codes.slice(0, 3).join('・') || '—'
          : suffix,
      iconName: 'bolt',
      accent: '#22c55e',
      state,
      asOf,
    },
    {
      key: 'weekExDiv',
      title: '本週除息',
      label: '本週除息',
      displayValue: buildValue(summary?.weekExDiv.count),
      value: buildValue(summary?.weekExDiv.count),
      unit: '檔',
      sub:
        state === 'ready' && summary && Number.isFinite(summary.weekExDiv.watchlistCount)
          ? `自選股 ${summary.weekExDiv.watchlistCount} 檔`
          : suffix,
      iconName: 'calendar',
      accent: '#3b82f6',
      state,
      asOf,
    },
    {
      key: 'pendingFill',
      title: '待填息',
      label: '待填息',
      displayValue: buildValue(summary?.pendingFill.count),
      value: buildValue(summary?.pendingFill.count),
      unit: '檔',
      sub:
        state === 'ready' && summary && summary.pendingFill.maxDays > 0
          ? `最長 ${summary.pendingFill.maxDays} 日`
          : suffix,
      iconName: 'clock',
      accent: '#f59e0b',
      state,
      asOf,
    },
    {
      key: 'nextPayout',
      title: '下次入帳',
      label: '下次入帳',
      displayValue: buildValue(summary?.nextPayout.estimatedAmount),
      value: buildValue(summary?.nextPayout.estimatedAmount),
      unit: '元',
      sub: state === 'ready' ? formatReadableDate(summary?.nextPayout.date) : suffix,
      iconName: 'banknotes',
      accent: '#a855f7',
      state,
      asOf,
    },
  ]
}
