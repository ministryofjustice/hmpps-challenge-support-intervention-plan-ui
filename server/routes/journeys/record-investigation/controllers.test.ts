import type { Request, Response } from 'express'
import config from '../../../config'
import { ProtectiveFactorsController } from './protective-factors/controller'
import { TriggersController } from './triggers/controller'
import { UsualBehaviourPresentationController } from './usual-behaviour-presentation/controller'

const responseFixture = {
  prisonerId: 'A1234AA',
  referralId: 'ref-123',
  behaviourType: 'usual_behaviour_presentation' as const,
  sortField: 'relevance' as const,
  sortOrder: 'desc' as const,
  suggestedCaseNotes: [
    {
      relevance: 'high' as const,
      case_note_id: '1',
      annotated_case_note: 'Example',
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

    expect(suggestedCaseNotesService.getSuggestedCaseNotes).toHaveBeenCalledWith(req, {
      referralId: 'ref-123',
      behaviourType: 'usual_behaviour_presentation',
      sortField: 'relevance',
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
        behaviourType: 'risks_and_triggers',
      }),
    }
    const controller = new TriggersController(suggestedCaseNotesService as never)
    const req = buildRequest('/record-investigation/triggers')
    const res = buildResponse()

    await controller.GET(req, res)

    expect(suggestedCaseNotesService.getSuggestedCaseNotes).toHaveBeenCalledWith(req, {
      referralId: 'ref-123',
      behaviourType: 'risks_and_triggers',
      sortField: 'relevance',
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
        behaviourType: 'protective_factors',
      }),
    }
    const controller = new ProtectiveFactorsController(suggestedCaseNotesService as never)
    const req = buildRequest('/record-investigation/protective-factors')
    const res = buildResponse()

    await controller.GET(req, res)

    expect(suggestedCaseNotesService.getSuggestedCaseNotes).toHaveBeenCalledWith(req, {
      referralId: 'ref-123',
      behaviourType: 'protective_factors',
      sortField: 'relevance',
      sortOrder: 'desc',
    })
    expect(res.render).toHaveBeenCalledWith(
      'record-investigation/protective-factors/view',
      expect.objectContaining({ showSuggestedCaseNotesWidget: true }),
    )
  })
})

const buildRequest = (path: string): Request => {
  return {
    query: {},
    path,
    originalUrl: path,
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
