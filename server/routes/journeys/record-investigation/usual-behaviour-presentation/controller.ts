import { Request, Response } from 'express'
import { SchemaType } from './schemas'
import SuggestedCaseNotesService from '../../../../services/suggestedCaseNotes/suggestedCaseNotesService'
import { loadSuggestedCaseNotesWidget } from '../suggestedCaseNotesWidget'

export class UsualBehaviourPresentationController {
  constructor(private readonly suggestedCaseNotesService: SuggestedCaseNotesService) {}

  GET = async (req: Request, res: Response) => {
    const personsUsualBehaviour =
      res.locals.formResponses?.['personsUsualBehaviour'] ?? req.journeyData.investigation?.personsUsualBehaviour
    const { showSuggestedCaseNotesWidget, suggestedCaseNotesWidget } = await loadSuggestedCaseNotesWidget({
      req,
      res,
      suggestedCaseNotesService: this.suggestedCaseNotesService,
      behaviourType: 'usual_behaviour_presentation',
      pageName: 'usual behaviour presentation',
    })

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
