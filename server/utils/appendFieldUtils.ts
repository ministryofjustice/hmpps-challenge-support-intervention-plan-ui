import { formatDisplayDateTime } from './datetimeUtils'
/**
 * If the description + divider test is equal to or more than 3000 characters, then show the character count
 * If the description + divider text is less than 3000 characters, do not show the character count until the user reaches a total of 3000 characters for all entries plus dividers
 */
export const generateSaveTimestamp = (username: string) =>
  `\n\n[On ${formatDisplayDateTime(new Date().toString())}, ${username} added:]\n\n`

export const getMaxCharsAndThreshold = (username: string, appendField?: string) => {
  const timestampLength = generateSaveTimestamp(username).length
  const maxLengthChars = 4000 - timestampLength - (appendField || '').length
  if (timestampLength + (appendField || '').length >= 3000) {
    return {
      maxLengthChars,
      threshold: '0',
    }
  }
  return {
    maxLengthChars,
    threshold: String((1 - 1000 / maxLengthChars) * 100), // do not round this, else the percentage calculation is very inaccurate
  }
}
