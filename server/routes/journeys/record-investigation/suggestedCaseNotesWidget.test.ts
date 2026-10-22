import path from 'path'
import nunjucks from 'nunjucks'
import config from '../../../config'
import SuggestedCaseNotesService from '../../../services/suggestedCaseNotes/suggestedCaseNotesService'
import { formatDateLongMonthWith24HourTime } from '../../../utils/datetimeUtils'
import { firstNameSpaceLastName } from '../../../utils/miniProfileUtils'
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
      caseNoteId: '1',
      annotatedCaseNote: 'Before <span data="1">highlight</span> after',
    },
  ],
}

describe('loadSuggestedCaseNotesWidget', () => {
  const originalEnvironment = config.sentry.environment

  afterEach(() => {
    config.sentry.environment = originalEnvironment
  })

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

  describe.each([
    ['PRODUCTION', 'https://www.smartsurvey.co.uk/s/BZ4BKV/'],
    ['PRE-PRODUCTION', 'https://www.smartsurvey.co.uk/s/BZ4BKV/'],
    ['DEV', '#'],
    ['local', '#'],
    ['', '#'],
    ['unknown', '#'],
  ])('feedback link in %s', (environment, expectedHref) => {
    it.each([false, true])('always renders the report a problem link (API failure: %s)', async apiFailure => {
      config.sentry.environment = environment
      const getSuggestedCaseNotes = jest.fn()
      if (apiFailure) {
        getSuggestedCaseNotes.mockRejectedValue(new Error('boom'))
      } else {
        getSuggestedCaseNotes.mockResolvedValue(responseFixture)
      }
      const suggestedCaseNotesService = { getSuggestedCaseNotes } as unknown as SuggestedCaseNotesService

      const result = await loadSuggestedCaseNotesWidget({
        suggestedCaseNotesService,
        behaviourType: 'usual_behaviour_presentation',
        pageName: 'usual behaviour presentation',
        systemClientToken: 'token-1',
        activeCaseLoadId: 'MDI',
        prisonerNumber: 'A1234AA',
        referralId: 'ref-123',
        currentPath: '/record-investigation/usual-behaviour-presentation',
      })

      expect(result.suggestedCaseNotesWidget?.feedbackLinkHref).toBe(expectedHref)

      const templates = new nunjucks.Environment(
        new nunjucks.FileSystemLoader(path.resolve(__dirname, '../../../views')),
        { autoescape: true },
      )
      templates.addFilter('formatDisplayDateWith24HourTime', formatDateLongMonthWith24HourTime)
      templates.addFilter('firstNameSpaceLastName', firstNameSpaceLastName)
      const html = templates.renderString(
        '{% from "partials/suggestedCaseNotes/macro.njk" import suggestedCaseNotes %}{{ suggestedCaseNotes(widget) }}',
        { widget: result.suggestedCaseNotesWidget },
      )

      expect(html).toContain(`href="${expectedHref}"`)
      expect(html).toContain('target="_blank" rel="noopener noreferrer"')
      expect(html).toContain('This feature is new and being tested.')
      expect(html).toContain('Report a problem (opens in a new tab)')
      expect(html).toContain('data-qa="suggested-case-notes-widget"')

      // the feedback paragraph must appear after the "AI tool has identified..." subheading
      const subheadingIndex = html.indexOf('An AI tool has identified')
      const feedbackIndex = html.indexOf('data-qa="suggested-case-notes-feedback"')
      expect(subheadingIndex).toBeGreaterThan(-1)
      expect(feedbackIndex).toBeGreaterThan(subheadingIndex)
    })
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
      highlightToggleHref: '/record-investigation/triggers?sortField=createdDate&suggestedCaseNotesHighlighting=on',
      highlightToggleText: 'Turn on highlights',
    })
  })

  it('keeps the highlighting setting in sort links and the sort setting in the highlight link', async () => {
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
      sortFieldQuery: 'lastAmendedDate',
      highlightingQuery: 'off',
    })

    expect(result.suggestedCaseNotesWidget).toMatchObject({
      sortField: 'lastAmendedDate',
      highlightToggleHref:
        '/record-investigation/usual-behaviour-presentation?sortField=lastAmendedDate&suggestedCaseNotesHighlighting=on',
      sortOptions: [
        {
          field: 'lastAmendedDate',
          label: 'recently updated',
          qa: 'sort-by-most-recent-activity',
          selected: true,
          href: '/record-investigation/usual-behaviour-presentation?sortField=lastAmendedDate&suggestedCaseNotesHighlighting=off',
        },
        {
          field: 'createdDate',
          label: 'date created',
          qa: 'sort-by-date-created',
          selected: false,
          href: '/record-investigation/usual-behaviour-presentation?sortField=createdDate&suggestedCaseNotesHighlighting=off',
        },
      ],
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
