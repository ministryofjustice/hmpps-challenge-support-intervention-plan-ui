import { NextFunction, Request, Response } from 'express'
import { SchemaType } from '../../record-review/next-review-date/schemas'
import { PatchReviewController } from '../../base/patchReviewController'
import { formatDateConcise } from '../../../../utils/datetimeUtils'

export class UpdateNextReviewDateController extends PatchReviewController {
  GET = async (req: Request, res: Response) => {
    res.render('record-review/next-review-date/view', {
      nextReviewDate:
        res.locals.formResponses?.['nextReviewDate'] ?? formatDateConcise(req.journeyData.review!.nextReviewDate),
      isUpdate: true,
      backUrl: '../update-review',
      recordUuid: req.journeyData.csipRecord!.recordUuid,
    })
  }

  checkSubmitToAPI = async (req: Request<unknown, unknown, SchemaType>, _: Response, next: NextFunction) =>
    this.submitChanges({
      req,
      next,
      changes: {
        nextReviewDate: req.body.nextReviewDate,
      },
      message: 'You’ve updated the next review date',
    })

  POST = async (req: Request, res: Response) => {
    res.redirect(`/csip-records/${req.journeyData.csipRecord!.recordUuid}`)
  }
}
