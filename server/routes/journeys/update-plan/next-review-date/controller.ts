import { NextFunction, Request, Response } from 'express'
import { SchemaType } from '../../develop-an-initial-plan/next-review-date/schemas'
import { PatchPlanController } from '../../base/patchPlanController'
import { formatDateConcise } from '../../../../utils/datetimeUtils'

export class UpdateNextReviewDateController extends PatchPlanController {
  GET = async (req: Request, res: Response) => {
    res.render('develop-an-initial-plan/next-review-date/view', {
      nextCaseReviewDate:
        res.locals.formResponses?.['nextCaseReviewDate'] ?? formatDateConcise(req.journeyData.plan?.nextCaseReviewDate),
      isUpdate: true,
      recordUuid: req.journeyData.csipRecord!.recordUuid,
      backUrl: '../update-plan',
    })
  }

  checkSubmitToAPI = async (req: Request<unknown, unknown, SchemaType>, _res: Response, next: NextFunction) =>
    this.submitChanges({
      req,
      next,
      changes: {
        nextCaseReviewDate: req.body.nextCaseReviewDate,
      },
    })

  POST = async (req: Request, res: Response) => {
    res.redirect(`/csip-records/${req.journeyData.csipRecord!.recordUuid}`)
  }
}
