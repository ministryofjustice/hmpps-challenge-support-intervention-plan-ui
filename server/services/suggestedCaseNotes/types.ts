export type SuggestedCaseNotesBehaviourType =
  | 'usual_behaviour_presentation'
  | 'risks_and_triggers'
  | 'protective_factors'

export type SuggestedCaseNotesRequest = {
  referralId: string
  behaviourType: SuggestedCaseNotesBehaviourType
  sortField: 'relevance'
  sortOrder: 'asc' | 'desc'
}

export type SuggestedCaseNoteRelevance = 'high' | 'medium' | 'low'

export type SuggestedCaseNoteResponseItem = {
  relevance: SuggestedCaseNoteRelevance
  case_note_id: string
  annotated_case_note: string
  is_sensitive?: boolean
}

export type SuggestedCaseNotesResponse = {
  prisonerId: string
  referralId: string
  behaviourType: SuggestedCaseNotesBehaviourType
  sortField: 'relevance'
  sortOrder: 'asc' | 'desc'
  hasSensitiveNotes?: boolean
  userCanViewSensitiveNotes?: boolean
  suggestedCaseNotes: SuggestedCaseNoteResponseItem[]
}

const PRISONER_NUMBER_REGEX = /^[A-Z]\d{4}[A-Z]{2}$/

export const normalisePrisonerNumber = (value: string): string => value.trim().toUpperCase()

export const isValidPrisonerNumber = (value: string): boolean => PRISONER_NUMBER_REGEX.test(value)
