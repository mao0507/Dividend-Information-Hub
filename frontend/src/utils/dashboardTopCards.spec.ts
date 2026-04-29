import { describe, expect, it } from 'vitest'
import { buildDashboardTopCards } from './dashboardTopCards'
import type { DashboardSummary } from '@/types'

const summaryFixture: DashboardSummary = {
  todayExDiv: { count: 2, codes: ['2330', '0050'] },
  weekExDiv: { count: 4, watchlistCount: 1 },
  pendingFill: { count: 3, maxDays: 18 },
  nextPayout: { date: '2026-05-20', estimatedAmount: 12345 },
  accumulatedIncome: 100000,
  accumulatedIncomeState: 'ready',
  yoyPct: 12.3,
  asOf: '2026-04-27T00:00:00.000Z',
}

describe('buildDashboardTopCards', () => {
  it('builds ready cards with summary values', () => {
    const cards = buildDashboardTopCards({
      summary: summaryFixture,
      asOf: '2026-04-27',
      hasError: false,
    })

    expect(cards).toHaveLength(4)
    expect(cards[0].state).toBe('ready')
    expect(cards[0].value).toBe(2)
    expect(cards[3].value).toBe(12345)
    expect(cards[3].sub).not.toContain('T')
  })

  it('returns neutral cards when summary is missing', () => {
    const cards = buildDashboardTopCards({
      summary: null,
      asOf: null,
      hasError: false,
    })

    expect(cards.every((c) => c.state === 'empty')).toBe(true)
    expect(cards.every((c) => c.value === '--')).toBe(true)
    expect(cards.every((c) => c.sub === '暫無資料')).toBe(true)
  })

  it('marks cards stale when summary exists but asOf is unavailable', () => {
    const cards = buildDashboardTopCards({
      summary: summaryFixture,
      asOf: null,
      hasError: false,
    })

    expect(cards.every((c) => c.state === 'stale')).toBe(true)
    expect(cards.every((c) => c.value === '--')).toBe(true)
    expect(cards[0].sub).toContain('同步中')
  })

  it('keeps neutral placeholder when partial fields are missing', () => {
    const cards = buildDashboardTopCards({
      summary: {
        ...summaryFixture,
        todayExDiv: { count: Number.NaN, codes: [] },
        nextPayout: { date: '', estimatedAmount: Number.NaN },
      },
      asOf: '2026-04-27',
      hasError: false,
    })

    expect(cards[0].value).toBe('--')
    expect(cards[3].value).toBe('--')
    expect(cards[3].sub).toBe('—')
  })

  it('falls back to neutral date when next payout date is invalid', () => {
    const cards = buildDashboardTopCards({
      summary: {
        ...summaryFixture,
        nextPayout: { date: 'not-a-date', estimatedAmount: 100 },
      },
      asOf: '2026-04-27',
      hasError: false,
    })

    expect(cards[3].sub).toBe('—')
  })

  it('marks cards as error when request failed', () => {
    const cards = buildDashboardTopCards({
      summary: summaryFixture,
      asOf: '2026-04-27',
      hasError: true,
    })

    expect(cards.every((c) => c.state === 'error')).toBe(true)
    expect(cards[1].sub).toContain('失敗')
  })
})
