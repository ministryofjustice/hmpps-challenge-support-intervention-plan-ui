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

    const result = await loadSuggestedCaseNotesWidget({
      suggestedCaseNotesService,
      behaviourType: 'risks_and_triggers',
      pageName: 'risks and triggers',
      systemClientToken: 'token-1',
      activeCaseLoadId: 'MDI',
      currentPath: '/record-investigation/triggers',
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

    const result = await loadSuggestedCaseNotesWidget({
      suggestedCaseNotesService,
      behaviourType: 'risks_and_triggers',
      pageName: 'risks and triggers',
      systemClientToken: 'token-1',
      activeCaseLoadId: 'MDI',
      prisonerNumber: 'A1234AA',
      referralId: 'ref-123',
      currentPath: '/record-investigation/triggers',
      highlightingQuery: 'off',
    })

    expect(result.showSuggestedCaseNotesWidget).toBe(true)
    expect(result.suggestedCaseNotesWidget).toMatchObject({
      behaviourType: 'risks_and_triggers',
      showHighlighting: false,
      highlightToggleHref: '/record-investigation/triggers?suggestedCaseNotesHighlighting=on',
      highlightToggleText: 'Turn highlighting on',
    })
  })

  it('defaults sortField to createdDate when the query value is not supported', async () => {
    const suggestedCaseNotesService = {
      getSuggestedCaseNotes: jest.fn().mockResolvedValue(responseFixture),
    } as unknown as SuggestedCaseNotesService

    const result = await loadSuggestedCaseNotesWidget({
      suggestedCaseNotesService,
      behaviourType: 'usual_behaviour_presentation',
      pageName: 'usual behaviour presentation',
      systemClientToken: 'token-1',
      activeCaseLoadId: 'MDI',
      prisonerNumber: 'A1234AA',
      referralId: 'ref-123',
      currentPath: '/record-investigation/usual-behaviour-presentation',
      sortFieldQuery: 'unsupportedSortField',
    })

    expect(suggestedCaseNotesService.getSuggestedCaseNotes).toHaveBeenCalledWith('token-1', 'A1234AA', {
      referralId: 'ref-123',
      behaviourType: 'usual_behaviour_presentation',
      sortField: 'createdDate',
      sortOrder: 'desc',
    })
    expect(result.suggestedCaseNotesWidget?.sortField).toBe('createdDate')
  })

  it('returns a non-blocking empty state when the API call fails', async () => {
    const suggestedCaseNotesService = {
      getSuggestedCaseNotes: jest.fn().mockRejectedValue(new Error('boom')),
    } as unknown as SuggestedCaseNotesService

    const result = await loadSuggestedCaseNotesWidget({
      suggestedCaseNotesService,
      behaviourType: 'protective_factors',
      pageName: 'protective factors',
      systemClientToken: 'token-1',
      activeCaseLoadId: 'MDI',
      prisonerNumber: 'A1234AA',
      referralId: 'ref-123',
      currentPath: '/record-investigation/protective-factors',
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
