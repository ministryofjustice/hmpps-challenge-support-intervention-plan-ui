import { Request, Response } from 'express'
import { SchemaType } from '../../record-review/outcome/schemas'

export class UpdateOutcomeController {
  GET = async (req: Request, res: Response) => {
    return res.render('record-review/outcome/view', {
      outcome: res.locals.formResponses?.['outcome'] ?? req.journeyData.review!.outcome,
      isUpdate: true,
      backUrl: '../update-review',
      recordUuid: req.journeyData.csipRecord!.recordUuid,
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
