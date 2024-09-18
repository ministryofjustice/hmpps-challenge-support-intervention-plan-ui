import { getMaxCharsAndThresholdForAppend } from './appendFieldUtils'

jest.mock('./datetimeUtils', () => {
  const originalModule = jest.requireActual('./datetimeUtils')

  return {
    __esModule: true,
    ...originalModule,
    default: jest.fn(() => 'mocked baz'),
    formatDisplayDateTime: () => `18 September 2024 at 12:00:00`,
  }
})

it('should always have a threshold of 1000 chars', () => {
  const dividerLength = `\n\n[On 18 September 2024 at 12:00:00, bob jones added:]\n\n`.length
  ;[...Array(4000).keys()].forEach(num => {
    const { maxLengthChars, threshold } = getMaxCharsAndThresholdForAppend('bob jones', 'a'.repeat(num))
    if (dividerLength + num >= 3000) {
      expect(maxLengthChars).toBe(4000 - dividerLength - num)
      expect(threshold).toBe('0')
      return
    }
    expect(maxLengthChars).toBe(4000 - dividerLength - num)
    expect(maxLengthChars - Math.round(maxLengthChars * (Number(threshold) / 100))).toEqual(1000)
  })
})
