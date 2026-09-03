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

const buildHighlightToggleHref = (currentPath: string, showHighlighting: boolean): string =>
  `${currentPath}?suggestedCaseNotesHighlighting=${showHighlighting ? 'off' : 'on'}`

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
    sortFieldQuery && ['createdDate', 'lastAmendedDate'].includes(sortFieldQuery) ? sortFieldQuery : 'createdDate'
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

    if (suggestedCaseNotesWidget.notes.length > 0) {
      suggestedCaseNotesWidget.highlightToggleHref = buildHighlightToggleHref(currentPath, showHighlighting)
      suggestedCaseNotesWidget.highlightToggleText = showHighlighting ? 'Turn highlighting off' : 'Turn highlighting on'
    }

    return {
      showSuggestedCaseNotesWidget,
      suggestedCaseNotesWidget: { ...suggestedCaseNotesWidget, sortField },
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
        notes: [],
      },
    }
  }
}
