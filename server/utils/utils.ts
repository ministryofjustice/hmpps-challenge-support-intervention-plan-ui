const properCase = (word: string): string =>
  word.length >= 1 && word[0] ? word[0].toUpperCase() + word.toLowerCase().slice(1) : word

const isBlank = (str: string): boolean => !str || /^\s*$/.test(str)

/**
 * Converts a name (first name, last name, middle name, etc.) to proper case equivalent, handling double-barreled names
 * correctly (i.e. each part in a double-barreled is converted to proper case).
 * @param name name to be converted.
 * @returns name converted to proper case.
 */
const properCaseName = (name: string): string => (isBlank(name) ? '' : name.split('-').map(properCase).join('-'))

export const convertToTitleCase = (sentence: string | null | undefined): string =>
  !sentence || isBlank(sentence) ? '' : sentence.split(' ').map(properCaseName).join(' ')

export const initialiseName = (fullName: string | undefined | null): string | null => {
  // this check is for the authError page
  if (!fullName) return null

  const array = fullName.split(' ')
  if (array.length < 1) {
    return null
  }
  const firstName = array[0]
  if (!firstName) {
    return null
  }
  return `${firstName[0]}. ${array.reverse()[0]}`
}

const isLowerCase = (val: string): boolean => /^[a-z]*$/.test(val)

const lowercaseExceptAcronym = (val: string): string => {
  if (val.includes('-')) {
    return val
      .split('-')
      .map(part => (Array.from(part).some(isLowerCase) ? part.toLowerCase() : part))
      .join('-')
  }

  if (val.length < 2 || Array.from(val).some(isLowerCase)) {
    return val.toLowerCase()
  }
  return val
}

export const sentenceCase = (val: string, startsWithUppercase: boolean = true): string => {
  const words = val.split(/\s+/)
  const sentence = words.map(lowercaseExceptAcronym).join(' ')
  return startsWithUppercase ? sentence.charAt(0).toUpperCase() + sentence.slice(1) : sentence
}

export const getNonUndefinedProp = <T>(referral: T, key: keyof T, mapper?: (obj: unknown) => string | null) => {
  if (referral[key] !== undefined) {
    return { [key]: mapper ? mapper(referral[key]) : referral[key] }
  }
  return {}
}

export const ordinalNumber = (number: number) => {
  if (!Number.isInteger(number)) throw new Error('Not available')
  if (number < 0) throw new Error('Should not be used with negative numbers')
  if (number < 10) {
    return ['zeroth', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth'][number]
  }
  const ordinal = ['st', 'nd', 'rd'][((((number + 90) % 100) - 10) % 10) - 1] || 'th'
  return number + ordinal
}

const APPEND_STAMP_REGEX = /\n(\[.+?])\n/g

export const boldAppendStamp = (val: string) => {
  const res: string[] = []
  let endIndex = 0

  val.matchAll(APPEND_STAMP_REGEX).forEach(match => {
    res.push(val.substring(endIndex, match.index))
    res.push('\n<strong>')
    res.push(match[1]!)
    res.push('</strong>\n')
    endIndex = match.index + match[0].length
  })

  res.push(val.substring(endIndex))

  return res.join('')
}
