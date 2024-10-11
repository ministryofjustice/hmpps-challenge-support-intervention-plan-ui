import { Request, Response } from 'express'
import { BaseJourneyController } from '../base/controller'

export class RecordReviewController extends BaseJourneyController {
  GET = async (req: Request, res: Response) => {
    res.render('record-review/view', {
      logCode: req.journeyData.csipRecord!.logCode,
      review: req.journeyData.review,
    })
  }
}
