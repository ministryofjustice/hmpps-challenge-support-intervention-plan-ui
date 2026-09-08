import { Request, Response } from 'express'
import { SchemaType } from './schemas'
import SuggestedCaseNotesService from '../../../../services/suggestedCaseNotes/suggestedCaseNotesService'
import { loadSuggestedCaseNotesWidget } from '../suggestedCaseNotesWidget'

export class ProtectiveFactorsController {
  constructor(private readonly suggestedCaseNotesService: SuggestedCaseNotesService) {}

  GET = async (req: Request, res: Response) => {
    const protectiveFactors =
      res.locals.formResponses?.['protectiveFactors'] ?? req.journeyData.investigation?.protectiveFactors
    const { showSuggestedCaseNotesWidget, suggestedCaseNotesWidget } = await loadSuggestedCaseNotesWidget({
      suggestedCaseNotesService: this.suggestedCaseNotesService,
      behaviourType: 'protective_factors',
      pageName: 'protective factors',
      systemClientToken: req.systemClientToken,
      activeCaseLoadId: res.locals.user.activeCaseLoad?.caseLoadId || res.locals.user.activeCaseLoadId,
      prisonerNumber: req.journeyData.prisoner?.prisonerNumber,
      referralId: req.journeyData.csipRecord?.recordUuid,
      currentPath: (req.originalUrl || req.path || '').split('?')[0]!,
      sortFieldQuery: req.query['sortField'] as string,
      highlightingQuery: req.query['suggestedCaseNotesHighlighting'] as string,
    })

    res.render('record-investigation/protective-factors/view', {
      protectiveFactors,
      backUrl: '../record-investigation',
      maxLengthChars: 4000,
      showSuggestedCaseNotesWidget,
      suggestedCaseNotesWidget,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.investigation!.protectiveFactors = req.body.protectiveFactors
    res.redirect('../record-investigation')
  }
}
