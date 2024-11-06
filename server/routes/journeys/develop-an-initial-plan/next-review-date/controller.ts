import { Request, Response } from 'express'
import { SchemaType } from './schemas'
import { formatDateConcise } from '../../../../utils/datetimeUtils'

export class NextReviewDateController {
  GET = async (req: Request, res: Response) => {
    const backUrl = req.journeyData.isCheckAnswers ? 'check-answers' : 'identified-needs'

    res.render('develop-an-initial-plan/next-review-date/view', {
      backUrl,
      nextCaseReviewDate:
        res.locals.formResponses?.['nextCaseReviewDate'] || formatDateConcise(req.journeyData.plan!.nextCaseReviewDate),
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.plan!.nextCaseReviewDate = req.body.nextCaseReviewDate
    req.journeyData.plan!.isComplete = true
    res.redirect('check-answers')
  }
}
