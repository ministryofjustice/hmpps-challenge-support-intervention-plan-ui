import { Request, Response } from 'express'
import { SchemaType } from './schemas'
import { BaseJourneyController } from '../../base/controller'

export class ConclusionController extends BaseJourneyController {
  GET = async (req: Request, res: Response) => {
    const outcomeTypeOptions = await this.getReferenceDataOptionsForRadios(
      req,
      'decision-outcome-type',
      res.locals.formResponses?.['outcome'] || req.journeyData.decisionAndActions!.outcome,
    )

    res.render('record-decision/conclusion/view', {
      conclusion: res.locals.formResponses?.['conclusion'] || req.journeyData.decisionAndActions?.conclusion,
      outcomeTypeOptions,
      backUrl: '../record-decision',
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.decisionAndActions!.outcome = req.body.outcome
    req.journeyData.decisionAndActions!.conclusion = req.body.conclusion
    res.redirect('next-steps')
  }
}
