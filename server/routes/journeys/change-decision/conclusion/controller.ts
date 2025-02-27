import { Request, Response } from 'express'
import { BaseJourneyController } from '../../base/controller'
import { SchemaType } from '../../record-decision/conclusion/schemas'

export class ConclusionController extends BaseJourneyController {
  GET = async (req: Request, res: Response) => {
    const outcomeTypeOptions = await this.getReferenceDataOptionsForRadios(
      req,
      'decision-outcome-type',
      res.locals.formResponses?.['outcome'] ?? req.journeyData.decisionAndActions!.outcome,
    )

    res.render('record-decision/conclusion/view', {
      conclusion: res.locals.formResponses?.['conclusion'] ?? req.journeyData.decisionAndActions?.conclusion,
      outcomeTypeOptions,
      backUrl: '../record-decision',
      changeDecision: true,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.decisionAndActions!.outcome = req.body.outcome
    req.journeyData.decisionAndActions!.conclusion = req.body.conclusion
    res.redirect('next-steps')
  }
}
