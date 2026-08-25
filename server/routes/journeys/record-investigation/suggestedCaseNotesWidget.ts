import { Request, Response } from 'express'
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

const getShowHighlighting = (req: Request): boolean => req.query['suggestedCaseNotesHighlighting'] !== 'off'

const buildHighlightToggleHref = (req: Request, showHighlighting: boolean): string => {
  const currentPath = (req.originalUrl || req.path || '').split('?')[0]
  return `${currentPath}?suggestedCaseNotesHighlighting=${showHighlighting ? 'off' : 'on'}`
}

export const loadSuggestedCaseNotesWidget = async ({
  req,
  res,
  suggestedCaseNotesService,
  behaviourType,
  pageName,
  forceShow = false,
  previewResponse,
}: {
  req: Request
  res: Response
  suggestedCaseNotesService: SuggestedCaseNotesService
  behaviourType: SuggestedCaseNotesBehaviourType
  pageName: string
  forceShow?: boolean
  previewResponse?: SuggestedCaseNotesResponse
}): Promise<{ showSuggestedCaseNotesWidget: boolean; suggestedCaseNotesWidget?: SuggestedCaseNotesWidgetModel }> => {
  let sortField = req.query['sortField'] as string
  if (!sortField || !['createdDate', 'lastAmendedDate'].includes(sortField)) {
    sortField = 'createdDate'
  }
  const showSuggestedCaseNotesWidget =
    forceShow || csipAssistEnabled(res.locals.user.activeCaseLoad?.caseLoadId || res.locals.user.activeCaseLoadId)

  if (!showSuggestedCaseNotesWidget) {
    return { showSuggestedCaseNotesWidget }
  }

  const showHighlighting = getShowHighlighting(req)

  try {
    const response =
      previewResponse ??
      (await suggestedCaseNotesService.getSuggestedCaseNotes(req, {
        referralId: req.journeyData.csipRecord?.recordUuid ?? '',
        behaviourType,
        sortField,
        sortOrder: 'desc',
      }))

    if (process.env.NODE_ENV === 'development') {
      logger.info(
        {
          prisonerNumber: req.journeyData.prisoner?.prisonerNumber,
          referralId: req.journeyData.csipRecord?.recordUuid,
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
      suggestedCaseNotesWidget.highlightToggleHref = buildHighlightToggleHref(req, showHighlighting)
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
