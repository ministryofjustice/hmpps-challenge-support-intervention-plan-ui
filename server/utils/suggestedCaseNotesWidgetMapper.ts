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
}

const relevanceRank: Record<'high' | 'medium' | 'low', number> = {
  high: 3,
  medium: 2,
  low: 1,
}

const labelForRelevance = (relevance: SuggestedCaseNoteResponseItem['relevance']): 'Low' | 'Medium' | 'High' =>
  relevance[0]!.toUpperCase().concat(relevance.slice(1)) as 'Low' | 'Medium' | 'High'

const stripSupportedMarkup = (text: string): string => text.replace(/<\/?(?:mark|strong)\b[^>]*>/gi, '')

const buildTextFragments = (annotatedText: string): SuggestedCaseNoteTextFragment[] => {
  const markRegex = /<mark\b[^>]*>([\s\S]*?)<\/mark>/gi
  const fragments: SuggestedCaseNoteTextFragment[] = []

  let lastIndex = 0

  // Parse mark tags into safe text fragments so templates never render raw HTML.
  for (let match = markRegex.exec(annotatedText); match !== null; match = markRegex.exec(annotatedText)) {
    const plainTextBefore = stripSupportedMarkup(annotatedText.slice(lastIndex, match.index))
    if (plainTextBefore) {
      fragments.push({ text: plainTextBefore, highlighted: false })
    }

    const highlightedText = stripSupportedMarkup(match[1] ?? '')
    if (highlightedText) {
      fragments.push({ text: highlightedText, highlighted: true })
    }

    lastIndex = markRegex.lastIndex
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
