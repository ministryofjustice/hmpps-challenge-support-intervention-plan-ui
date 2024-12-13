import { NextFunction, Request, Response } from 'express'
import { PatchPlanController } from '../../base/patchPlanController'

export class CloseIdentifiedNeedController extends PatchPlanController {
  GET = async (req: Request, res: Response, next: NextFunction) => {
    const identifiedNeed = this.getSelectedIdentifiedNeed(req as Request)

    if (!identifiedNeed) {
      return res.notFound()
    }

    if (identifiedNeed.closedDate) {
      return next(Error(`Identified need with uuid: ${identifiedNeed.identifiedNeedUuid} is already closed`))
    }

    return res.render('update-plan/close-identified-need/view', {
      identifiedNeed,
      recordUuid: req.journeyData.csipRecord!.recordUuid,
      backUrl: '../identified-needs',
    })
  }

  checkSubmitToAPI = async (req: Request, res: Response, next: NextFunction) => {
    const identifiedNeed = this.getSelectedIdentifiedNeed(req)

    if (!identifiedNeed) {
      return res.notFound()
    }
    return this.closeIdentifiedNeed({
      req,
      res,
      next,
      identifiedNeedUuid: identifiedNeed.identifiedNeedUuid!,
    })
  }

  POST = this.deleteJourneyDataAndGoBackToCsipRecordPage
}
