import { formatDisplayDateTime } from './datetimeUtils'
/**
 * If the description + divider test is equal to or more than 3000 characters, then show the character count
 * If the description + divider text is less than 3000 characters, do not show the character count until the user reaches a total of 3000 characters for all entries plus dividers
 */
export const generateSaveTimestamp = (username: string) =>
  `\n\n[On ${formatDisplayDateTime(new Date().toString())}, ${username} added:]\n\n`

export const getMaxCharsAndThresholdForAppend = (username: string, appendField?: string) => {
  const timestampLength = generateSaveTimestamp(username).length
  const maxLengthChars = 4000 - timestampLength - (appendField || '').length
  return {
    maxLengthChars,
    threshold: '0',
  }
}
