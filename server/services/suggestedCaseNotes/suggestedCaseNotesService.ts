import { suggestedCaseNotesSampleData } from './suggestedCaseNotesSampleData'

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
}

export type SuggestedCaseNotesResponse = {
  prisonerId: string
  referralId: string
  behaviourType: SuggestedCaseNotesBehaviourType
  sortField: 'relevance'
  sortOrder: 'asc' | 'desc'
  suggestedCaseNotes: SuggestedCaseNoteResponseItem[]
}

export default class SuggestedCaseNotesService {
  private cachedResponse: SuggestedCaseNotesResponse | undefined

  async getSuggestedCaseNotes(request: SuggestedCaseNotesRequest): Promise<SuggestedCaseNotesResponse> {
    if (!this.cachedResponse) {
      this.cachedResponse = structuredClone(suggestedCaseNotesSampleData)
    }

    return {
      ...this.cachedResponse,
      referralId: request.referralId,
      behaviourType: request.behaviourType,
      sortField: request.sortField,
      sortOrder: request.sortOrder,
    }
  }
}
