import SuggestedCaseNotesService, {
} from './suggestedCaseNotesService'
import CsipApiService from '../csipApi/csipApiService'
import type { SuggestedCaseNotesRequest, SuggestedCaseNotesResponse } from './types'

const requestFixture: SuggestedCaseNotesRequest = {
  referralId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  behaviourType: 'usual_behaviour_presentation',
  sortField: 'relevance',
  sortOrder: 'desc',
}

const responseFixture: SuggestedCaseNotesResponse = {
  prisonerId: 'A1234AA',
  referralId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  behaviourType: 'usual_behaviour_presentation',
  sortField: 'relevance',
  sortOrder: 'desc',
  suggestedCaseNotes: [
    {
      relevance: 'high',
      case_note_id: 'f4ee95d0-49a4-46a2-a485-b8f26f089170',
      annotated_case_note: 'Example annotated note',
    },
  ],
}

describe('SuggestedCaseNotesService', () => {
  it('delegates to csip api service with prisoner number from journey data', async () => {
    const csipApiService = {
      getSuggestedCaseNotes: jest.fn().mockResolvedValue(responseFixture),
    } as unknown as jest.Mocked<CsipApiService>
    const service = new SuggestedCaseNotesService(csipApiService)
    const req = {
      journeyData: {
        prisoner: {
          prisonerNumber: 'A1234AA',
        },
      },
    }

    const response = await service.getSuggestedCaseNotes(req as any, requestFixture)

    expect(response).toEqual(responseFixture)
    expect(csipApiService.getSuggestedCaseNotes).toHaveBeenCalledWith(req, 'A1234AA', requestFixture)
  })

  it('throws when prisoner number is missing', async () => {
    const csipApiService = {
      getSuggestedCaseNotes: jest.fn(),
    } as unknown as jest.Mocked<CsipApiService>
    const service = new SuggestedCaseNotesService(csipApiService)
    const req = {
      journeyData: {},
    }

    await expect(service.getSuggestedCaseNotes(req as any, requestFixture)).rejects.toThrow(
      'Missing prisoner number for suggested case notes request',
    )
    expect(csipApiService.getSuggestedCaseNotes).not.toHaveBeenCalled()
  })

  it('normalises valid prisoner numbers before calling csip api service', async () => {
    const csipApiService = {
      getSuggestedCaseNotes: jest.fn().mockResolvedValue(responseFixture),
    } as unknown as jest.Mocked<CsipApiService>
    const service = new SuggestedCaseNotesService(csipApiService)
    const req = {
      journeyData: {
        prisoner: {
          prisonerNumber: ' a1234aa ',
        },
      },
    }

    await service.getSuggestedCaseNotes(req as any, requestFixture)

    expect(csipApiService.getSuggestedCaseNotes).toHaveBeenCalledWith(req, 'A1234AA', requestFixture)
  })

  it('throws when prisoner number format is invalid', async () => {
    const csipApiService = {
      getSuggestedCaseNotes: jest.fn(),
    } as unknown as jest.Mocked<CsipApiService>
    const service = new SuggestedCaseNotesService(csipApiService)
    const req = {
      journeyData: {
        prisoner: {
          prisonerNumber: 'INVALID',
        },
      },
    }

    await expect(service.getSuggestedCaseNotes(req as any, requestFixture)).rejects.toThrow(
      "Invalid prisoner number format for suggested case notes request: 'INVALID'",
    )
    expect(csipApiService.getSuggestedCaseNotes).not.toHaveBeenCalled()
  })
})
