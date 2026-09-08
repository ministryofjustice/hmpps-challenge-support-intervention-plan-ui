import { Request, Response } from 'express'
import { SchemaType } from './schemas'
import SuggestedCaseNotesService from '../../../../services/suggestedCaseNotes/suggestedCaseNotesService'
import { loadSuggestedCaseNotesWidget } from '../suggestedCaseNotesWidget'

export class TriggersController {
  constructor(private readonly suggestedCaseNotesService: SuggestedCaseNotesService) {}

  GET = async (req: Request, res: Response) => {
    const personsTrigger = res.locals.formResponses?.['personsTrigger'] ?? req.journeyData.investigation?.personsTrigger
    const { showSuggestedCaseNotesWidget, suggestedCaseNotesWidget } = await loadSuggestedCaseNotesWidget({
      suggestedCaseNotesService: this.suggestedCaseNotesService,
      behaviourType: 'risks_and_triggers',
      pageName: 'risks and triggers',
      systemClientToken: req.systemClientToken,
      activeCaseLoadId: res.locals.user.activeCaseLoad?.caseLoadId || res.locals.user.activeCaseLoadId,
      prisonerNumber: req.journeyData.prisoner?.prisonerNumber,
      referralId: req.journeyData.csipRecord?.recordUuid,
      currentPath: (req.originalUrl || req.path || '').split('?')[0]!,
      sortFieldQuery: req.query['sortField'] as string,
      highlightingQuery: req.query['suggestedCaseNotesHighlighting'] as string,
    })

    res.render('record-investigation/triggers/view', {
      personsTrigger,
      backUrl: '../record-investigation',
      maxLengthChars: 4000,
      showSuggestedCaseNotesWidget,
      suggestedCaseNotesWidget,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.investigation!.personsTrigger = req.body.personsTrigger
    res.redirect('../record-investigation')
  }
}
