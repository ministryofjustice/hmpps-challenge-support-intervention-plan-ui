import { Request, Response } from 'express'
import { SchemaType } from './schemas'

export class OutcomeController {
  GET = async (req: Request, res: Response) => {
    res.render('record-review/outcome/view', {
      outcome: res.locals.formResponses?.['outcome'] || req.journeyData.review?.outcome,
      backUrl: '../record-review',
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.review!.outcome = req.body.outcome
    if (req.body.outcome === 'CLOSE_CSIP') {
      return res.redirect('close-csip')
    }
    return res.redirect('next-review-date')
  }
}
