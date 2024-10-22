import { NextFunction, Request, Response } from 'express'
import { SchemaType } from '../../record-review/details/schemas'
import { PatchReviewController } from '../../base/patchReviewController'

export class UpdateDetailsController extends PatchReviewController {
  GET = async (req: Request, res: Response) => {
    req.journeyData.isUpdate = true
    const currentDetails = req.journeyData.review?.summary
    res.render('record-review/details/view', {
      summary: res.locals.formResponses?.['summary'] ?? currentDetails,
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
        summary: req.body.summary,
      },
    })

  POST = async (req: Request, res: Response) => {
    res.redirect(`/csip-records/${req.journeyData.csipRecord!.recordUuid}`)
  }
}
