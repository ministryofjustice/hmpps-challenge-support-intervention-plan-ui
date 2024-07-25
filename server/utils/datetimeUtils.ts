import z from 'zod'

const DATE_FORMAT_GB = new Intl.DateTimeFormat('en-GB', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const DATE_FORMAT_GB_VERBOSE = new Intl.DateTimeFormat('en-GB', {
  year: 'numeric',
  month: 'long',
  day: '2-digit',
})

const RESULT_VALIDATOR = z.string().min(1)

const parseNumber = (value: string, min: number, max: number, length: number) => {
  const result =
    Number.isNaN(Number(value)) || Number(value) < min || Number(value) > max || value.length > length
      ? null
      : value.padStart(length, '0')
  return RESULT_VALIDATOR.safeParse(result)
}

export const parse24Hour = (value: string) => parseNumber(value, 0, 23, 2)

export const parseMinute = (value: string) => parseNumber(value, 0, 59, 2)

// parse dd/mm/yyyy date string from Datepicker component into yyyy-mm-dd format
export const parseDate = (value: string) => {
  const date =
    value.length !== 10
      ? null
      : new Date(Date.parse(`${value.substring(6, 10)}-${value.substring(3, 5)}-${value.substring(0, 2)}`))
  const result = date === null || Number.isNaN(date) ? null : date.toISOString().substring(0, 10)
  return RESULT_VALIDATOR.safeParse(result)
}

// format ISO Date into GB date string
export const formatInputDate = (value?: string) => value && DATE_FORMAT_GB.format(new Date(Date.parse(value)))

export const formatDisplayDate = (value?: string) => value && DATE_FORMAT_GB_VERBOSE.format(new Date(Date.parse(value)))

// format HH:mm time into separate input field values HH and mm
export const formatInputTime = (value?: string) => {
  if (!value || value.length !== 5) {
    return [null, null]
  }
  return [value.substring(0, 2), value.substring(3, 5)]
}

export const todayString = () => new Date().toISOString().substring(0, 10)

export const todayStringGBFormat = () => DATE_FORMAT_GB.format(new Date())
