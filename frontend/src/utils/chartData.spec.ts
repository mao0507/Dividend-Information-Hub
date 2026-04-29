import { describe, it, expect } from 'vitest'
import { normalizeChartData, toChartDayKey } from '@/utils/chartData'

describe('chartData', () => {
  it('normalizes ISO date strings to YYYY-MM-DD for chart keys', () => {
    expect(toChartDayKey('2026-04-27T00:00:00.000Z')).toBe('2026-04-27')
  })

  it('converts ISO timestamp to Asia/Taipei day key', () => {
    expect(toChartDayKey('2025-12-24T16:00:00.000Z')).toBe('2025-12-25')
  })

  it('accepts OHLC rows with ISO date from API', () => {
    const raw = [
      {
        date: '2026-01-02T00:00:00.000Z',
        open: 100,
        high: 101,
        low: 99,
        close: 100.5,
        volume: 1000,
      },
    ]
    const n = normalizeChartData(raw)
    expect(n.kind).toBe('ready')
    if (n.kind === 'ready') {
      expect(n.candles[0].date).toBe('2026-01-02')
    }
  })

  it('keeps only rows with valid date and close > 0', () => {
    const raw = [
      { date: '2026-01-01', open: 100, high: 101, low: 99, close: 100, volume: 1 },
      { date: '2026-01-02', open: 100, high: 101, low: 99, close: 0, volume: 1 },
      { date: 'invalid-date', open: 100, high: 101, low: 99, close: 100, volume: 1 },
      { date: '2026-01-05', open: 101, high: 102, low: 100, close: 101, volume: 2 },
    ]
    const n = normalizeChartData(raw)
    expect(n.kind).toBe('ready')
    if (n.kind === 'ready') {
      expect(n.candles.map((x) => x.date)).toEqual(['2026-01-01', '2026-01-05'])
      expect(n.candles).toHaveLength(2)
    }
  })

  it('returns empty when all rows are invalid', () => {
    const raw = [
      { date: '2026-01-01', open: 100, high: 101, low: 99, close: 0, volume: 1 },
      { date: 'bad-date', open: 101, high: 102, low: 100, close: 101, volume: 1 },
    ]
    const n = normalizeChartData(raw)
    expect(n.kind).toBe('empty')
  })

  it('filters out weekend rows even when close is valid', () => {
    const raw = [
      { date: '2026-01-02', open: 100, high: 101, low: 99, close: 100, volume: 1 }, // Fri
      { date: '2026-01-03', open: 101, high: 102, low: 100, close: 101, volume: 1 }, // Sat
      { date: '2026-01-04', open: 102, high: 103, low: 101, close: 102, volume: 1 }, // Sun
      { date: '2026-01-05', open: 103, high: 104, low: 102, close: 103, volume: 1 }, // Mon
    ]
    const n = normalizeChartData(raw)
    expect(n.kind).toBe('ready')
    if (n.kind === 'ready') {
      expect(n.candles.map((x) => x.date)).toEqual(['2026-01-02', '2026-01-05'])
    }
  })

  it('filters out dates included in twse closed date set', () => {
    const raw = [
      { date: '2026-01-05T16:00:00.000Z', open: 100, high: 101, low: 99, close: 100, volume: 1 }, // 台北 01-06
      { date: '2026-01-06T16:00:00.000Z', open: 101, high: 102, low: 100, close: 101, volume: 1 }, // 台北 01-07
    ]
    const n = normalizeChartData(raw, {
      closedDates: new Set(['2026-01-07']),
    })
    expect(n.kind).toBe('ready')
    if (n.kind === 'ready') {
      expect(n.candles.map((x) => x.date)).toEqual(['2026-01-06'])
    }
  })

  it('keeps labels/series index alignment by date order after filtering', () => {
    const raw = [
      { date: '2026-01-05', open: 103, high: 105, low: 101, close: 104, volume: 3 },
      { date: '2026-01-02', open: 100, high: 101, low: 99, close: 0, volume: 2 },
      { date: '2026-01-01', open: 98, high: 100, low: 97, close: 99, volume: 1 },
    ]
    const n = normalizeChartData(raw)
    expect(n.kind).toBe('ready')
    if (n.kind === 'ready') {
      expect(n.candles[0].date).toBe('2026-01-01')
      expect(n.candles[0].close).toBe(99)
      expect(n.candles[1].date).toBe('2026-01-05')
      expect(n.candles[1].close).toBe(104)
    }
  })

  it('keeps last row when same date appears multiple times', () => {
    const raw = [
      { date: '2026-01-01', open: 100, high: 101, low: 99, close: 100, volume: 1 },
      { date: '2026-01-01', open: 110, high: 111, low: 109, close: 110, volume: 2 },
    ]
    const n = normalizeChartData(raw)
    expect(n.kind).toBe('ready')
    if (n.kind === 'ready') {
      expect(n.candles).toHaveLength(1)
      expect(n.candles[0].close).toBe(110)
      expect(n.candles[0].volume).toBe(2)
    }
  })
})
