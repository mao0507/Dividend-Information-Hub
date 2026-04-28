import {
  addTaipeiCalendarDays,
  getTaipeiCalendarDayRange,
  getTaipeiCalendarWeekRange,
  getTaipeiWeekdayOffsetFromMonday,
  getTaipeiYmdFromInstant,
} from './dashboard-taipei-range.util'

describe('dashboard-taipei-range.util', () => {
  describe('getTaipeiYmdFromInstant', () => {
    it('maps UTC instant to Taipei calendar when Taipei is next local date', () => {
      const instant = new Date('2026-04-27T17:00:00.000Z')
      expect(getTaipeiYmdFromInstant(instant)).toEqual({
        y: 2026,
        m: 4,
        d: 28,
      })
    })
  })

  describe('getTaipeiWeekdayOffsetFromMonday', () => {
    it('returns 0 for Monday and 6 for Sunday (same Taipei week)', () => {
      const mon = new Date('2026-04-27T10:00:00+08:00')
      const sun = new Date('2026-05-03T10:00:00+08:00')
      expect(getTaipeiWeekdayOffsetFromMonday(mon)).toBe(0)
      expect(getTaipeiWeekdayOffsetFromMonday(sun)).toBe(6)
    })
  })

  describe('getTaipeiCalendarWeekRange', () => {
    it('returns Mon 00:00 through Sun 23:59:59.999 Taipei for a Tuesday in the same week', () => {
      const ref = new Date('2026-04-28T12:00:00+08:00')
      const { weekStart, weekEnd } = getTaipeiCalendarWeekRange(ref)
      expect(weekStart.toISOString()).toBe('2026-04-26T16:00:00.000Z')
      expect(weekEnd.toISOString()).toBe('2026-05-03T15:59:59.999Z')
    })

    it('when reference is Sunday, week ends that calendar Sunday', () => {
      const ref = new Date('2026-05-03T08:00:00+08:00')
      const { weekStart, weekEnd } = getTaipeiCalendarWeekRange(ref)
      expect(weekStart.toISOString()).toBe('2026-04-26T16:00:00.000Z')
      expect(weekEnd.toISOString()).toBe('2026-05-03T15:59:59.999Z')
    })
  })

  describe('getTaipeiCalendarDayRange', () => {
    it('covers full Taipei calendar day', () => {
      const ref = new Date('2026-04-29T02:00:00+08:00')
      const { dayStart, dayEnd } = getTaipeiCalendarDayRange(ref)
      expect(dayStart.toISOString()).toBe('2026-04-28T16:00:00.000Z')
      expect(dayEnd.toISOString()).toBe('2026-04-29T15:59:59.999Z')
    })
  })

  describe('addTaipeiCalendarDays', () => {
    it('crosses month boundary correctly', () => {
      const next = addTaipeiCalendarDays(2026, 4, 30, 1)
      expect(next).toEqual({ y: 2026, m: 5, d: 1 })
    })
  })
})
