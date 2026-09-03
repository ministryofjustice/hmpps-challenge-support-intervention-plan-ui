import CsipApiService from '../csipApi/csipApiService'
import {
  isValidPrisonerNumber,
  normalisePrisonerNumber,
  SuggestedCaseNotesRequest,
  SuggestedCaseNotesResponse,
} from './types'

export type { SuggestedCaseNotesBehaviourType, SuggestedCaseNotesRequest, SuggestedCaseNotesResponse } from './types'

export default class SuggestedCaseNotesService {
  constructor(private readonly csipApiService: CsipApiService) {}

  async getSuggestedCaseNotes(
    systemClientToken: string,
    prisonerNumberValue: string | undefined,
    request: SuggestedCaseNotesRequest,
  ): Promise<SuggestedCaseNotesResponse> {
    if (!prisonerNumberValue) {
      throw new Error('Missing prisoner number for suggested case notes request')
    }

    const prisonerNumber = normalisePrisonerNumber(prisonerNumberValue)

    if (!isValidPrisonerNumber(prisonerNumber)) {
      throw new Error(`Invalid prisoner number format for suggested case notes request: '${prisonerNumberValue}'`)
    }

    return this.csipApiService.getSuggestedCaseNotes(systemClientToken, prisonerNumber, request)
  }
}
