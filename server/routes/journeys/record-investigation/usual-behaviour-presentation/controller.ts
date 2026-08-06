import { Request, Response } from 'express'
import { SchemaType } from './schemas'
import csipAssistEnabled from '../../../../utils/featureToggles'
import SuggestedCaseNotesService from '../../../../services/suggestedCaseNotes/suggestedCaseNotesService'
import {
  buildSuggestedCaseNotesWidgetModel,
  SuggestedCaseNotesWidgetModel,
} from '../../../../utils/suggestedCaseNotesWidgetMapper'
import logger from '../../../../../logger'

export class UsualBehaviourPresentationController {
  constructor(private readonly suggestedCaseNotesService: SuggestedCaseNotesService) {}

  GET = async (req: Request, res: Response) => {
    const personsUsualBehaviour =
      res.locals.formResponses?.['personsUsualBehaviour'] ?? req.journeyData.investigation?.personsUsualBehaviour
    const showSuggestedCaseNotesWidget = csipAssistEnabled(
      res.locals.user.activeCaseLoad?.caseLoadId || res.locals.user.activeCaseLoadId,
    )

    let suggestedCaseNotesWidget: SuggestedCaseNotesWidgetModel | undefined

    if (showSuggestedCaseNotesWidget) {
      try {
        const response = await this.suggestedCaseNotesService.getSuggestedCaseNotes(req, {
          referralId: req.journeyData.csipRecord?.recordUuid ?? '',
          behaviourType: 'usual_behaviour_presentation',
          sortField: 'relevance',
          sortOrder: 'desc',
        })

        if (process.env.NODE_ENV === 'development') {
          logger.info(
            {
              prisonerNumber: req.journeyData.prisoner?.prisonerNumber,
              referralId: req.journeyData.csipRecord?.recordUuid,
              suggestedCaseNotesResponse: response,
            },
            'Suggested case notes response received',
          )
        }

        suggestedCaseNotesWidget = buildSuggestedCaseNotesWidgetModel({
          response,
          showHighlighting: true,
        })
      } catch (error) {
        logger.warn(error, 'Failed to load suggested case notes for usual behaviour presentation page')
        suggestedCaseNotesWidget = {
          behaviourType: 'usual_behaviour_presentation',
          showHighlighting: true,
          emptyStateMessage:
            'Suggested Case Notes are temporarily unavailable. You can still continue and save this page.',
          notes: [],
        }
      }
    }

    res.render('record-investigation/usual-behaviour-presentation/view', {
      personsUsualBehaviour,
      backUrl: '../record-investigation',
      maxLengthChars: 4000,
      showSuggestedCaseNotesWidget,
      suggestedCaseNotesWidget,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.investigation!.personsUsualBehaviour = req.body.personsUsualBehaviour
    res.redirect('../record-investigation')
  }
}
