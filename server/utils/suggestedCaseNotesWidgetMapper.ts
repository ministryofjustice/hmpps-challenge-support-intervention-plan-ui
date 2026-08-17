import {
  SuggestedCaseNotesBehaviourType,
  SuggestedCaseNoteResponseItem,
  SuggestedCaseNotesResponse,
} from '../services/suggestedCaseNotes/types'

export type SuggestedCaseNoteTextFragment = {
  text: string
  highlighted: boolean
}

export type SuggestedCaseNotesWidgetCard = {
  itemId: string
  caseNoteText: string
  relevanceLabel: 'Low' | 'Medium' | 'High'
  textFragments: SuggestedCaseNoteTextFragment[]
}

export type SuggestedCaseNotesWidgetModel = {
  behaviourType: SuggestedCaseNotesBehaviourType
  showHighlighting: boolean
  emptyStateMessage: string
  notes: SuggestedCaseNotesWidgetCard[]
  highlightToggleHref?: string
  highlightToggleText?: string
}

const relevanceRank: Record<'high' | 'medium' | 'low', number> = {
  high: 3,
  medium: 2,
  low: 1,
}

const labelForRelevance = (relevance: SuggestedCaseNoteResponseItem['relevance']): 'Low' | 'Medium' | 'High' =>
  relevance[0]!.toUpperCase().concat(relevance.slice(1)) as 'Low' | 'Medium' | 'High'

const stripSupportedMarkup = (text: string): string => text.replace(/<\/?(?:mark|span|strong)\b[^>]*>/gi, '')

const shouldSuppressSensitiveNotes = (response: SuggestedCaseNotesResponse): boolean => {
  const hasSensitiveNotes = response.hasSensitiveNotes || response.suggestedCaseNotes.some(item => item.is_sensitive)

  return hasSensitiveNotes === true && response.userCanViewSensitiveNotes === false
}

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
  if (shouldSuppressSensitiveNotes(response)) {
    return {
      behaviourType: response.behaviourType,
      showHighlighting,
      emptyStateMessage:
        'Suggested Case Notes cannot be shown because you do not have permission to view sensitive notes.',
      notes: [],
    }
  }

  const sortedNotes = [...response.suggestedCaseNotes].sort(
    (a, b) => relevanceRank[b.relevance] - relevanceRank[a.relevance],
  )

  const notes = sortedNotes.map(item => {
    return {
      itemId: item.case_note_id,
      caseNoteText: stripSupportedMarkup(item.annotated_case_note),
      relevanceLabel: labelForRelevance(item.relevance),
      textFragments: buildTextFragments(item.annotated_case_note),
    }
  })

  return {
    behaviourType: response.behaviourType,
    showHighlighting,
    emptyStateMessage: 'No suggested case notes are available for this record right now.',
    notes,
  }
}
