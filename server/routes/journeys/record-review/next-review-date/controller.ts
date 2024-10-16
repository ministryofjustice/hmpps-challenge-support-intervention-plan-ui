import { Request, Response } from 'express'
import { SchemaType } from './schemas'
import { formatInputDate } from '../../../../utils/datetimeUtils'

export class NextReviewDateController {
  GET = async (req: Request, res: Response) => {
    res.render('record-review/next-review-date/view', {
      nextReviewDate:
        res.locals.formResponses?.['nextReviewDate'] || formatInputDate(req.journeyData.review?.nextReviewDate),
      backUrl: 'outcome',
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.review!.nextReviewDate = req.body.nextReviewDate
    res.redirect('../record-review')
  }
}
