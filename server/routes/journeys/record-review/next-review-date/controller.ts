import { Request, Response } from 'express'
import { SchemaType } from './schemas'
import { formatDateConcise } from '../../../../utils/datetimeUtils'

export class NextReviewDateController {
  GET = async (req: Request, res: Response) => {
    res.render('record-review/next-review-date/view', {
      nextReviewDate:
        res.locals.formResponses?.['nextReviewDate'] ?? formatDateConcise(req.journeyData.review?.nextReviewDate),
      backUrl:
        req.journeyData.isCheckAnswers && !req.journeyData.review!.outcomeSubJourney ? 'check-answers' : 'outcome',
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    if (req.journeyData.review!.outcomeSubJourney?.outcome) {
      req.journeyData.review!.outcome = req.journeyData.review!.outcomeSubJourney.outcome
      delete req.journeyData.review!.outcomeSubJourney
    }
    req.journeyData.review!.nextReviewDate = req.body.nextReviewDate
    res.redirect(req.journeyData.isCheckAnswers ? 'check-answers' : '../record-review')
  }
}
