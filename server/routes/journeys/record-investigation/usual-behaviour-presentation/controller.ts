import { Request, Response } from 'express'
import { SchemaType } from './schemas'
import csipAssistEnabled from '../../../../../utils/featureToggles'

export class UsualBehaviourPresentationController {
  GET = async (req: Request, res: Response) => {
    const personsUsualBehaviour =
      res.locals.formResponses?.['personsUsualBehaviour'] ?? req.journeyData.investigation?.personsUsualBehaviour
    const showSuggestedCaseNotesWidget = csipAssistEnabled(
      res.locals.user.activeCaseLoad?.caseLoadId || res.locals.user.activeCaseLoadId,
    )

    res.render('record-investigation/usual-behaviour-presentation/view', {
      personsUsualBehaviour,
      backUrl: '../record-investigation',
      maxLengthChars: 4000,
      showSuggestedCaseNotesWidget,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.investigation!.personsUsualBehaviour = req.body.personsUsualBehaviour
    res.redirect('../record-investigation')
  }
}
