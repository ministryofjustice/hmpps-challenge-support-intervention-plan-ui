import { Request, Response } from 'express'
import { SchemaType } from './schemas'

export class OutcomeController {
  GET = async (req: Request, res: Response) => {
    res.render('record-review/outcome/view', {
      outcome:
        res.locals.formResponses?.['outcome'] ??
        req.journeyData.review!.outcomeSubJourney?.outcome ??
        req.journeyData.review!.outcome,
      backUrl: req.journeyData.isCheckAnswers ? 'check-answers' : '../record-review',
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.review!.outcomeSubJourney ??= {}
    req.journeyData.review!.outcomeSubJourney.outcome = req.body.outcome
    delete req.journeyData.review!.outcome
    if (req.body.outcome === 'CLOSE_CSIP') {
      return res.redirect('close-csip')
    }
    return res.redirect('next-review-date')
  }
}
