import { NextFunction, Request, Response } from 'express'
import { SchemaType } from '../../record-review/details/schemas'
import {
  MESSAGE_MOST_RECENT_REVIEW_UPDATED,
  MESSAGE_REVIEW_UPDATED,
  PatchReviewController,
} from '../../base/patchReviewController'

export class UpdateDetailsController extends PatchReviewController {
  GET = async (req: Request, res: Response) => {
    const currentDetails = req.journeyData.review?.summary
    res.render('record-review/details/view', {
      summary: res.locals.formResponses?.['summary'] ?? currentDetails,
      isUpdate: true,
      backUrl: '../update-review',
      recordUuid: req.journeyData.csipRecord!.recordUuid,
    })
  }

  checkSubmitToAPI = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) =>
    this.submitChanges({
      req,
      res,
      next,
      changes: {
        summary: req.body.summary,
      },
      message:
        req.journeyData.csipRecord!.plan!.reviews.length > 1
          ? MESSAGE_MOST_RECENT_REVIEW_UPDATED
          : MESSAGE_REVIEW_UPDATED,
    })

  POST = async (req: Request, res: Response) => {
    res.redirect(`/csip-records/${req.journeyData.csipRecord!.recordUuid}`)
  }
}
