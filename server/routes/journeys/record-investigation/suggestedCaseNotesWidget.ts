import logger from '../../../../logger'
import SuggestedCaseNotesService from '../../../services/suggestedCaseNotes/suggestedCaseNotesService'
import { SuggestedCaseNotesBehaviourType, SuggestedCaseNotesResponse } from '../../../services/suggestedCaseNotes/types'
import csipAssistEnabled from '../../../utils/featureToggles'
import {
  buildSuggestedCaseNotesWidgetModel,
  SuggestedCaseNotesWidgetModel,
} from '../../../utils/suggestedCaseNotesWidgetMapper'

const SUGGESTED_CASE_NOTES_UNAVAILABLE_MESSAGE =
  'Suggested Case Notes are temporarily unavailable. You can still continue and save this page.'

export type LoadSuggestedCaseNotesWidgetOptions = {
  suggestedCaseNotesService: SuggestedCaseNotesService
  behaviourType: SuggestedCaseNotesBehaviourType
  pageName: string
  systemClientToken: string
  activeCaseLoadId?: string | undefined
  prisonerNumber?: string | undefined
  referralId?: string | undefined
  currentPath: string
  sortFieldQuery?: string | undefined
  highlightingQuery?: string | undefined
  forceShow?: boolean
  previewResponse?: SuggestedCaseNotesResponse
}

const SORT_FIELDS = ['lastAmendedDate', 'createdDate'] as const
type SortField = (typeof SORT_FIELDS)[number]

const SORT_OPTION_DETAILS: Record<SortField, { label: string; qa: string }> = {
  lastAmendedDate: { label: 'recently updated', qa: 'sort-by-most-recent-activity' },
  createdDate: { label: 'date created', qa: 'sort-by-date-created' },
}

const buildWidgetHref = (currentPath: string, sortField: string, showHighlighting: boolean): string =>
  `${currentPath}?${new URLSearchParams({
    sortField,
    suggestedCaseNotesHighlighting: showHighlighting ? 'on' : 'off',
  })}`

export const buildSuggestedCaseNotesControls = (
  currentPath: string,
  sortField: string,
  showHighlighting: boolean,
): Required<Pick<SuggestedCaseNotesWidgetModel, 'sortOptions' | 'highlightToggleHref' | 'highlightToggleText'>> => ({
  sortOptions: SORT_FIELDS.map(field => ({
    field,
    ...SORT_OPTION_DETAILS[field],
    selected: field === sortField,
    href: buildWidgetHref(currentPath, field, showHighlighting),
  })),
  highlightToggleHref: buildWidgetHref(currentPath, sortField, !showHighlighting),
  highlightToggleText: showHighlighting ? 'Turn off highlights' : 'Turn on highlights',
})

export const loadSuggestedCaseNotesWidget = async ({
  suggestedCaseNotesService,
  behaviourType,
  pageName,
  systemClientToken,
  activeCaseLoadId,
  prisonerNumber,
  referralId,
  currentPath,
  sortFieldQuery,
  highlightingQuery,
  forceShow = false,
  previewResponse,
}: LoadSuggestedCaseNotesWidgetOptions): Promise<{
  showSuggestedCaseNotesWidget: boolean
  suggestedCaseNotesWidget?: SuggestedCaseNotesWidgetModel
}> => {
  const sortField =
    sortFieldQuery && (SORT_FIELDS as readonly string[]).includes(sortFieldQuery) ? sortFieldQuery : 'createdDate'
  const showSuggestedCaseNotesWidget = forceShow || csipAssistEnabled(activeCaseLoadId)

  if (!showSuggestedCaseNotesWidget) {
    return { showSuggestedCaseNotesWidget }
  }

  const showHighlighting = highlightingQuery !== 'off'

  try {
    const response =
      previewResponse ??
      (await suggestedCaseNotesService.getSuggestedCaseNotes(systemClientToken, prisonerNumber, {
        referralId: referralId ?? '',
        behaviourType,
        sortField,
        sortOrder: 'desc',
      }))

    if (process.env.NODE_ENV === 'development') {
      logger.info(
        {
          prisonerNumber,
          referralId,
          suggestedCaseNotesResponse: response,
          behaviourType,
          pageName,
        },
        'Suggested case notes response received',
      )
    }

    const suggestedCaseNotesWidget = buildSuggestedCaseNotesWidgetModel({
      response,
      showHighlighting,
    })

    const { sortOptions, highlightToggleHref, highlightToggleText } = buildSuggestedCaseNotesControls(
      currentPath,
      sortField,
      showHighlighting,
    )

    return {
      showSuggestedCaseNotesWidget,
      suggestedCaseNotesWidget: {
        ...suggestedCaseNotesWidget,
        sortField,
        sortOptions,
        ...(suggestedCaseNotesWidget.notes.length > 0 ? { highlightToggleHref, highlightToggleText } : {}),
      },
    }
  } catch (error) {
    logger.warn(error, `Failed to load suggested case notes for ${pageName} page`)

    return {
      showSuggestedCaseNotesWidget,
      suggestedCaseNotesWidget: {
        behaviourType,
        showHighlighting,
        emptyStateMessage: SUGGESTED_CASE_NOTES_UNAVAILABLE_MESSAGE,
        sortField,
        sortOptions: buildSuggestedCaseNotesControls(currentPath, sortField, showHighlighting).sortOptions,
        notes: [],
      },
    }
  }
}
