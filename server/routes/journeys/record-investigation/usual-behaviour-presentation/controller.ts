import { Request, Response } from 'express'
import { SchemaType } from './schemas'
import csipAssistEnabled from '../../../../utils/featureToggles'
import SuggestedCaseNotesService from '../../../../services/suggestedCaseNotes/suggestedCaseNotesService'
import {
  buildSuggestedCaseNotesWidgetModel,
  SuggestedCaseNotesWidgetModel,
} from '../../../../utils/suggestedCaseNotesWidgetMapper'

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
      const response = await this.suggestedCaseNotesService.getSuggestedCaseNotes()
      suggestedCaseNotesWidget = buildSuggestedCaseNotesWidgetModel({
        response,
        showHighlighting: true,
      })
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
