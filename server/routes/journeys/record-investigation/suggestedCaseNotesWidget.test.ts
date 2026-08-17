import type { Request, Response } from 'express'
import config from '../../../config'
import SuggestedCaseNotesService from '../../../services/suggestedCaseNotes/suggestedCaseNotesService'
import { loadSuggestedCaseNotesWidget } from './suggestedCaseNotesWidget'

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
      annotated_case_note: 'Before <span data="1">highlight</span> after',
    },
  ],
}

describe('loadSuggestedCaseNotesWidget', () => {
  beforeEach(() => {
    config.features.csipAssistEnabled = true
    config.features.csipAssistActivePrisons = 'MDI'
  })

  it('returns no widget when the feature is disabled for the active prison', async () => {
    config.features.csipAssistActivePrisons = 'LEI'
    const suggestedCaseNotesService = {
      getSuggestedCaseNotes: jest.fn(),
    } as unknown as SuggestedCaseNotesService

    const req = {
      query: {},
      path: '/record-investigation/triggers',
      originalUrl: '/record-investigation/triggers',
      journeyData: {},
    } as unknown as Request
    const res = {
      locals: {
        user: {
          activeCaseLoadId: 'MDI',
        },
      },
    } as Response

    const result = await loadSuggestedCaseNotesWidget({
      req,
      res,
      suggestedCaseNotesService,
      behaviourType: 'risks_and_triggers',
      pageName: 'risks and triggers',
    })

    expect(result).toEqual({ showSuggestedCaseNotesWidget: false })
    expect(suggestedCaseNotesService.getSuggestedCaseNotes).not.toHaveBeenCalled()
  })

  it('builds a widget with highlighting disabled from the query string and toggle metadata', async () => {
    const suggestedCaseNotesService = {
      getSuggestedCaseNotes: jest.fn().mockResolvedValue({
        ...responseFixture,
        behaviourType: 'risks_and_triggers',
      }),
    } as unknown as SuggestedCaseNotesService

    const req = {
      query: { suggestedCaseNotesHighlighting: 'off' },
      path: '/record-investigation/triggers',
      originalUrl: '/record-investigation/triggers?suggestedCaseNotesHighlighting=off',
      journeyData: {
        prisoner: { prisonerNumber: 'A1234AA' },
        csipRecord: { recordUuid: 'ref-123' },
      },
    } as unknown as Request
    const res = {
      locals: {
        user: {
          activeCaseLoadId: 'MDI',
        },
      },
    } as Response

    const result = await loadSuggestedCaseNotesWidget({
      req,
      res,
      suggestedCaseNotesService,
      behaviourType: 'risks_and_triggers',
      pageName: 'risks and triggers',
    })

    expect(result.showSuggestedCaseNotesWidget).toBe(true)
    expect(result.suggestedCaseNotesWidget).toMatchObject({
      behaviourType: 'risks_and_triggers',
      showHighlighting: false,
      highlightToggleHref: '/record-investigation/triggers?suggestedCaseNotesHighlighting=on',
      highlightToggleText: 'Turn highlighting on',
    })
  })

  it('returns a non-blocking empty state when the API call fails', async () => {
    const suggestedCaseNotesService = {
      getSuggestedCaseNotes: jest.fn().mockRejectedValue(new Error('boom')),
    } as unknown as SuggestedCaseNotesService

    const req = {
      query: {},
      path: '/record-investigation/protective-factors',
      originalUrl: '/record-investigation/protective-factors',
      journeyData: {
        prisoner: { prisonerNumber: 'A1234AA' },
        csipRecord: { recordUuid: 'ref-123' },
      },
    } as unknown as Request
    const res = {
      locals: {
        user: {
          activeCaseLoadId: 'MDI',
        },
      },
    } as Response

    const result = await loadSuggestedCaseNotesWidget({
      req,
      res,
      suggestedCaseNotesService,
      behaviourType: 'protective_factors',
      pageName: 'protective factors',
    })

    expect(result).toMatchObject({
      showSuggestedCaseNotesWidget: true,
      suggestedCaseNotesWidget: {
        behaviourType: 'protective_factors',
        showHighlighting: true,
        notes: [],
        emptyStateMessage:
          'Suggested Case Notes are temporarily unavailable. You can still continue and save this page.',
      },
    })
  })
})
