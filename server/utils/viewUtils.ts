import { YES_NO_ANSWER } from '../routes/journeys/referral/safer-custody/schemas'
import { getMaxCharsAndThresholdForAppend } from './appendFieldUtils'

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

export function yesNoNotKnown(text: string) {
  if (text === YES_NO_ANSWER.enum.YES) {
    return 'Yes'
  }

  if (text === YES_NO_ANSWER.enum.NO) {
    return 'No'
  }

  return 'Not known'
}

type SummaryListActionData = {
  href: string
  text: string
  visuallyHiddenText: string
  classes: string
}

export function summaryListActionAddInformation(
  value: string,
  isUpdate: boolean,
  username: string,
  existingText: string,
  data: SummaryListActionData,
) {
  if (!isUpdate) {
    return value
  }

  const { maxLengthChars } = getMaxCharsAndThresholdForAppend(username, existingText)

  if (maxLengthChars <= 0) {
    return `${value}
    <dd class="govuk-summary-list__actions">
      <span>This field has reached its character limit. You cannot add anymore characters.
      </span>
    </dd>`
  }

  return summaryListActionChange(value, isUpdate, data)
}

export function summaryListActionChange(value: string, isUpdate: boolean, data: SummaryListActionData) {
  if (!isUpdate) {
    return value
  }

  return `${value}
  <dd class="govuk-summary-list__actions">
    <a class="govuk-link govuk-link--no-visited-state" href="${data.href}">
      ${data.text}
      <span class="govuk-visually-hidden"> ${data.visuallyHiddenText}</span>
    </a>
  </dd>`
}

export function withVisuallyHiddenText(visibleText: string, hiddenText: string) {
  return { html: `${visibleText} <span class="govuk-visually-hidden">${hiddenText}</span>` }
}
