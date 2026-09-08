import type { Request, Response } from 'express'
import config from '../../../config'
import { ProtectiveFactorsController } from './protective-factors/controller'
import { TriggersController } from './triggers/controller'
import { UsualBehaviourPresentationController } from './usual-behaviour-presentation/controller'

const responseFixture = {
  prisonerId: 'A1234AA',
  referralId: 'ref-123',
  behaviourType: 'usualBehaviourPresentation' as const,
  sortField: 'createdDate' as const,
  sortOrder: 'desc' as const,
  suggestedCaseNotes: [
    {
      relevance: 'high' as const,
      caseNoteId: '1',
      annotatedCaseNote: 'Example',
    },
  ],
}

describe('record investigation suggested case notes controllers', () => {
  beforeEach(() => {
    config.features.csipAssistEnabled = true
    config.features.csipAssistActivePrisons = 'MDI'
  })

  it('uses usual behaviour behaviourType when loading the usual behaviour page', async () => {
    const suggestedCaseNotesService = {
      getSuggestedCaseNotes: jest.fn().mockResolvedValue(responseFixture),
    }
    const controller = new UsualBehaviourPresentationController(suggestedCaseNotesService as never)
    const req = buildRequest('/record-investigation/usual-behaviour-presentation')
    const res = buildResponse()

    await controller.GET(req, res)

    expect(suggestedCaseNotesService.getSuggestedCaseNotes).toHaveBeenCalledWith('token-1', 'A1234AA', {
      referralId: 'ref-123',
      behaviourType: 'usualBehaviourPresentation',
      sortField: 'createdDate',
      sortOrder: 'desc',
    })
    expect(res.render).toHaveBeenCalledWith(
      'record-investigation/usual-behaviour-presentation/view',
      expect.objectContaining({ showSuggestedCaseNotesWidget: true }),
    )
  })

  it('uses risks and triggers behaviourType when loading the triggers page', async () => {
    const suggestedCaseNotesService = {
      getSuggestedCaseNotes: jest.fn().mockResolvedValue({
        ...responseFixture,
        behaviourType: 'risksAndTriggers',
      }),
    }
    const controller = new TriggersController(suggestedCaseNotesService as never)
    const req = buildRequest('/record-investigation/triggers')
    const res = buildResponse()

    await controller.GET(req, res)

    expect(suggestedCaseNotesService.getSuggestedCaseNotes).toHaveBeenCalledWith('token-1', 'A1234AA', {
      referralId: 'ref-123',
      behaviourType: 'risksAndTriggers',
      sortField: 'createdDate',
      sortOrder: 'desc',
    })
    expect(res.render).toHaveBeenCalledWith(
      'record-investigation/triggers/view',
      expect.objectContaining({ showSuggestedCaseNotesWidget: true }),
    )
  })

  it('uses protective factors behaviourType when loading the protective factors page', async () => {
    const suggestedCaseNotesService = {
      getSuggestedCaseNotes: jest.fn().mockResolvedValue({
        ...responseFixture,
        behaviourType: 'protectiveFactors',
      }),
    }
    const controller = new ProtectiveFactorsController(suggestedCaseNotesService as never)
    const req = buildRequest('/record-investigation/protective-factors')
    const res = buildResponse()

    await controller.GET(req, res)

    expect(suggestedCaseNotesService.getSuggestedCaseNotes).toHaveBeenCalledWith('token-1', 'A1234AA', {
      referralId: 'ref-123',
      behaviourType: 'protectiveFactors',
      sortField: 'createdDate',
      sortOrder: 'desc',
    })
    expect(res.render).toHaveBeenCalledWith(
      'record-investigation/protective-factors/view',
      expect.objectContaining({ showSuggestedCaseNotesWidget: true }),
    )
  })

  it('passes sortField from query through to suggested case notes service', async () => {
    const suggestedCaseNotesService = {
      getSuggestedCaseNotes: jest.fn().mockResolvedValue(responseFixture),
    }
    const controller = new UsualBehaviourPresentationController(suggestedCaseNotesService as never)
    const req = buildRequest('/record-investigation/usual-behaviour-presentation', {
      sortField: 'lastAmendedDate',
    })
    const res = buildResponse()

    await controller.GET(req, res)

    expect(suggestedCaseNotesService.getSuggestedCaseNotes).toHaveBeenCalledWith('token-1', 'A1234AA', {
      referralId: 'ref-123',
      behaviourType: 'usualBehaviourPresentation',
      sortField: 'lastAmendedDate',
      sortOrder: 'desc',
    })
  })
})

const buildRequest = (path: string, query: Record<string, string> = {}): Request => {
  return {
    query,
    path,
    originalUrl: path,
    systemClientToken: 'token-1',
    journeyData: {
      investigation: {},
      prisoner: { prisonerNumber: 'A1234AA' },
      csipRecord: { recordUuid: 'ref-123' },
    },
  } as unknown as Request
}

const buildResponse = (): Response => {
  return {
    locals: {
      user: {
        activeCaseLoadId: 'MDI',
      },
    },
    render: jest.fn(),
  } as unknown as Response
}
