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
      suggestedCaseNotesService: this.suggestedCaseNotesService,
      behaviourType: 'usual_behaviour_presentation',
      pageName: 'usual behaviour presentation',
      systemClientToken: req.systemClientToken,
      activeCaseLoadId: res.locals.user.activeCaseLoad?.caseLoadId || res.locals.user.activeCaseLoadId,
      prisonerNumber: req.journeyData.prisoner?.prisonerNumber,
      referralId: req.journeyData.csipRecord?.recordUuid,
      currentPath: (req.originalUrl || req.path || '').split('?')[0]!,
      sortFieldQuery: req.query['sortField'] as string,
      highlightingQuery: req.query['suggestedCaseNotesHighlighting'] as string,
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
