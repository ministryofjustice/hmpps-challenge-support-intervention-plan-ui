const DATE_FORMAT_GB = new Intl.DateTimeFormat('en-GB', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

class ParseResult {
  constructor(public data?: string) {}

  get success() {
    return !!this.data
  }
}

const parseNumber = (value: string, min: number, max: number, length: number): ParseResult => {
  if (Number.isNaN(value) || Number(value) < min || Number(value) > max || value.length > length) {
    return new ParseResult()
  }

  return new ParseResult(value.padStart(length, '0'))
}

export const parse24Hour = (value: string) => parseNumber(value, 0, 23, 2)

export const parseMinute = (value: string) => parseNumber(value, 0, 59, 2)

// parse dd/mm/yyyy date string from Datepicker component into yyyy-mm-dd format
export const parseDate = (value: string): ParseResult => {
  if (value.length !== 10) {
    return new ParseResult()
  }
  const date = new Date(Date.parse(`${value.substring(6, 10)}-${value.substring(3, 5)}-${value.substring(0, 2)}`))
  if (Number.isNaN(date)) {
    return new ParseResult()
  }
  return new ParseResult(date.toISOString().substring(0, 10))
}

// format ISO Date into GB date string
export const formatInputDate = (value?: string) => value && DATE_FORMAT_GB.format(new Date(Date.parse(value)))

// format HH:mm time into separate input field values HH and mm
export const formatInputTime = (value?: string) => {
  if (!value || value.length !== 5) {
    return [null, null]
  }
  return [value.substring(0, 2), value.substring(3, 5)]
}

export const todayString = () => new Date().toISOString().substring(0, 10)
