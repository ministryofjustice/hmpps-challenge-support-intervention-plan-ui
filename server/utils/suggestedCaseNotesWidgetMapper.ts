import { SuggestedCaseNotesBehaviourType, SuggestedCaseNotesResponse } from '../services/suggestedCaseNotes/types'

export type SuggestedCaseNoteTextFragment = {
  text: string
  highlighted: boolean
}

export type SuggestedCaseNotesSortKeys = {
  createdDate?: number
  lastAmendedDate?: number
}

export type SuggestedCaseNotesWidgetCard = {
  itemId: string
  caseNoteText: string
  textFragments: SuggestedCaseNoteTextFragment[]
  createdAt?: string
  createdBy?: string
  location?: string
  type?: string
  amendments: { createdAt: string; textFragments: SuggestedCaseNoteTextFragment[] }[]
  sortKeys: SuggestedCaseNotesSortKeys
}

export type SuggestedCaseNotesSortOption = {
  field: string
  label: string
  qa: string
  selected: boolean
  href: string
}

export type SuggestedCaseNotesWidgetModel = {
  behaviourType: SuggestedCaseNotesBehaviourType
  showHighlighting: boolean
  emptyStateMessage: string
  notes: SuggestedCaseNotesWidgetCard[]
  highlightToggleHref?: string
  highlightToggleText?: string
  sortField: string
  sortOptions?: SuggestedCaseNotesSortOption[]
}

const toTimestamp = (value: string | undefined): number | undefined => {
  if (!value) return undefined
  const timestamp = Date.parse(value)
  return Number.isNaN(timestamp) ? undefined : timestamp
}

const buildSortKeys = (
  createdAt: string | undefined,
  amendments: { createdAt: string }[],
): SuggestedCaseNotesSortKeys => {
  const createdDate = toTimestamp(createdAt)
  const amendmentTimestamps = amendments
    .map(amendment => toTimestamp(amendment.createdAt))
    .filter((timestamp): timestamp is number => timestamp !== undefined)
  const latestAmendment = amendmentTimestamps.length ? Math.max(...amendmentTimestamps) : undefined
  const lastAmendedDate =
    latestAmendment !== undefined && (createdDate === undefined || latestAmendment > createdDate)
      ? latestAmendment
      : createdDate

  return {
    ...(createdDate !== undefined ? { createdDate } : {}),
    ...(lastAmendedDate !== undefined ? { lastAmendedDate } : {}),
  }
}

const stripSupportedMarkup = (text: string): string => text.replace(/<\/?(?:mark|span|strong)\b[^>]*>/gi, '')

const buildTextFragments = (annotatedText: string): SuggestedCaseNoteTextFragment[] => {
  const annotationRegex = /<(mark|span)\b[^>]*>([\s\S]*?)<\/\1>/gi
  const fragments: SuggestedCaseNoteTextFragment[] = []

  let lastIndex = 0

  // Parse supported annotation tags into safe text fragments so templates never render raw HTML.
  for (let match = annotationRegex.exec(annotatedText); match !== null; match = annotationRegex.exec(annotatedText)) {
    const plainTextBefore = stripSupportedMarkup(annotatedText.slice(lastIndex, match.index))
    if (plainTextBefore) {
      fragments.push({ text: plainTextBefore, highlighted: false })
    }

    const highlightedText = stripSupportedMarkup(match[2] ?? '')
    if (highlightedText) {
      fragments.push({ text: highlightedText, highlighted: true })
    }

    lastIndex = annotationRegex.lastIndex
  }

  const plainTextAfter = stripSupportedMarkup(annotatedText.slice(lastIndex))
  if (plainTextAfter) {
    fragments.push({ text: plainTextAfter, highlighted: false })
  }

  return fragments.length ? fragments : [{ text: stripSupportedMarkup(annotatedText), highlighted: false }]
}

export const buildSuggestedCaseNotesWidgetModel = ({
  response,
  showHighlighting = true,
}: {
  response: SuggestedCaseNotesResponse
  showHighlighting?: boolean
}): SuggestedCaseNotesWidgetModel => {
  const notes = response.suggestedCaseNotes.map(item => {
    const note = {
      itemId: item.caseNoteId,
      caseNoteText: stripSupportedMarkup(item.annotatedCaseNote),
      textFragments: buildTextFragments(item.annotatedCaseNote),
      amendments: (item.amendments ?? []).map(amendment => ({
        createdAt: amendment.createdAt,
        textFragments: buildTextFragments(amendment.annotatedText),
      })),
      sortKeys: buildSortKeys(item.createdAt, item.amendments ?? []),
    }

    return {
      ...note,
      ...(item.createdAt ? { createdAt: item.createdAt } : {}),
      ...(item.createdBy ? { createdBy: item.createdBy } : {}),
      ...(item.location ? { location: item.location } : {}),
      ...(item.type ? { type: item.type } : {}),
    }
  })

  return {
    behaviourType: response.behaviourType,
    showHighlighting,
    sortField: response.sortField,
    emptyStateMessage: 'No suggested case notes are available for this record right now.',
    notes,
  }
}
