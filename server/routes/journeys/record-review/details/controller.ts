import { Request, Response } from 'express'
import { SchemaType } from './schemas'

export class SummaryController {
  GET = async (req: Request, res: Response) => {
    const summary = res.locals.formResponses?.['summary'] ?? req.journeyData.review?.summary
    res.render('record-review/details/view', {
      summary,
      backUrl: '../record-review',
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.review!.summary = req.body.summary
    res.redirect('../record-review')
  }
}
