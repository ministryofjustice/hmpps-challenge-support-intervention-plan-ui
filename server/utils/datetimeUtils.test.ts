import { formatDateLongMonthWithTime } from './datetimeUtils'

describe('datetimeUtils', () => {
  describe('formatDateLongMonthWithTime', () => {
    it('formats an ISO date-time into long month format with time', () => {
      expect(formatDateLongMonthWithTime('2024-09-18T12:00:00')).toBe('18 September 2024, 12:00pm')
    })

    it('returns undefined when no value is provided', () => {
      expect(formatDateLongMonthWithTime()).toBeUndefined()
    })
  })
})
