import { formatDateLongMonthWith24HourTime, formatDateLongMonthWithTime } from './datetimeUtils'

describe('datetimeUtils', () => {
  describe('formatDateLongMonthWithTime', () => {
    it('formats an ISO date-time into long month format with time', () => {
      expect(formatDateLongMonthWithTime('2024-09-18T12:00:00')).toBe('18 September 2024, 12:00pm')
    })

    it('returns undefined when no value is provided', () => {
      expect(formatDateLongMonthWithTime()).toBeUndefined()
    })
  })

  describe('formatDateLongMonthWith24HourTime', () => {
    it('formats an ISO date-time into long month format with 24-hour time', () => {
      expect(formatDateLongMonthWith24HourTime('2024-09-18T14:30:00')).toBe('18 September 2024, 14:30')
    })

    it('formats midnight with a two-digit hour', () => {
      expect(formatDateLongMonthWith24HourTime('2024-09-18T00:05:00')).toBe('18 September 2024, 00:05')
    })

    it('returns undefined when no value is provided', () => {
      expect(formatDateLongMonthWith24HourTime()).toBeUndefined()
    })
  })
})
