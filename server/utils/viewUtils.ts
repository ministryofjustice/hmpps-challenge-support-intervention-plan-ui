interface SelectOption {
  text: string
  value: string | number
  selected?: boolean
  attributes?:
    | {
        hidden?: 'hidden'
        disabled?: 'disabled'
      }
    | undefined
}

export const addDefaultSelectedValue = (
  items: SelectOption[],
  text: string,
  setHidden = true,
): SelectOption[] | null => {
  if (!items) return null

  return [
    {
      text,
      value: '',
      selected: true,
      attributes: setHidden ? { hidden: 'hidden' } : undefined,
    },
    ...items,
  ]
}

export const setSelected = (items: { value: string; text: string }[], selected?: string) =>
  items &&
  items.map(entry => ({
    ...entry,
    selected: entry && String(entry.value) === selected,
  }))

const APPEND_STAMP_REGEX = /\n\n(\[.+?])\n\n|^(\[.+?])\n\n/g

export const boldAppendStamp = (val: string) => {
  const res: string[] = []
  let endIndex = 0

  val.matchAll(APPEND_STAMP_REGEX).forEach(match => {
    res.push(val.substring(endIndex, match.index))
    if (match[1]) {
      res.push('\n\n<strong>')
      res.push(match[1]!)
      res.push('</strong>\n\n')
    } else if (match[2]) {
      res.push('<strong>')
      res.push(match[2]!)
      res.push('</strong>\n\n')
    }
    endIndex = match.index + match[0].length
  })

  res.push(val.substring(endIndex))

  return res.join('')
}

export const softHyphenate = (text: string | undefined, maxLength: number) => {
  if (!text) {
    return ''
  }

  const res: string[] = []
  let endIndex = 0

  text.matchAll(/\s+/g).forEach(match => {
    res.push(addShys(text.substring(endIndex, match.index), maxLength))
    res.push(match[0])
    endIndex = match.index + match[0].length
  })
  res.push(addShys(text.substring(endIndex), maxLength))
  return res.join('')
}

const addShys = (text: string, threshold: number) => (text.length > threshold ? text.split('').join('&shy;') : text)
