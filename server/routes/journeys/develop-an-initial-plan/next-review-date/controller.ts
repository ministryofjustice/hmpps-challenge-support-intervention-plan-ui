import { Request, Response } from 'express'
import { SchemaType } from './schemas'
import { formatInputDate } from '../../../../utils/datetimeUtils'

export class NextReviewDateController {
  GET = async (req: Request, res: Response) => {
    const backUrl = req.journeyData.isCheckAnswers ? 'check-answers' : 'identified-needs'

    res.render('develop-an-initial-plan/next-review-date/view', {
      backUrl,
      firstCaseReviewDate:
        res.locals.formResponses?.['firstCaseReviewDate'] || formatInputDate(req.journeyData.plan!.firstCaseReviewDate),
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.plan!.firstCaseReviewDate = req.body.firstCaseReviewDate
    req.journeyData.plan!.isComplete = true
    res.redirect('check-answers')
  }
}
