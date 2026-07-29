import { readFile } from 'node:fs/promises'
import path from 'node:path'

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
  sortField: string
  sortOrder: 'asc' | 'desc'
  suggestedCaseNotes: SuggestedCaseNoteResponseItem[]
}

export default class SuggestedCaseNotesService {
  private readonly fixturePath = path.resolve(process.cwd(), '..', 'fixtures', 'csip-assist-response.json')

  private cachedResponse: SuggestedCaseNotesResponse | undefined

  async getSuggestedCaseNotes(request: SuggestedCaseNotesRequest): Promise<SuggestedCaseNotesResponse> {
    const shouldUseCache = process.env.NODE_ENV !== 'development'

    if (shouldUseCache && this.cachedResponse) {
      return {
        ...this.cachedResponse,
        referralId: request.referralId,
        behaviourType: request.behaviourType,
        sortField: request.sortField,
        sortOrder: request.sortOrder,
      }
    }

    const fileContents = await readFile(this.fixturePath, 'utf-8')
    const parsed = JSON.parse(fileContents) as SuggestedCaseNotesResponse

    if (shouldUseCache) {
      this.cachedResponse = parsed
    }

    return {
      ...parsed,
      referralId: request.referralId,
      behaviourType: request.behaviourType,
      sortField: request.sortField,
      sortOrder: request.sortOrder,
    }
  }
}
