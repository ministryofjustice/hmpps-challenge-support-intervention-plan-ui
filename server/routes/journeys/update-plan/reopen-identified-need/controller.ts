import { NextFunction, Request, Response } from 'express'
import { PatchPlanController } from '../../base/patchPlanController'

export class ReopenIdentifiedNeedController extends PatchPlanController {
  GET = async (req: Request, res: Response, next: NextFunction) => {
    const identifiedNeed = this.getSelectedIdentifiedNeed(req as Request)

    if (!identifiedNeed) {
      return res.notFound()
    }

    if (!identifiedNeed.closedDate) {
      return next(Error(`Identified need with uuid: ${identifiedNeed.identifiedNeedUuid} is not closed`))
    }

    return res.render('update-plan/reopen-identified-need/view', {
      need: res.locals.formResponses?.['identifiedNeed'] ?? identifiedNeed,
      recordUuid: req.journeyData.csipRecord!.recordUuid,
    })
  }

  checkSubmitToAPI = async (req: Request, res: Response, next: NextFunction) => {
    const identifiedNeed = this.getSelectedIdentifiedNeed(req)

    if (!identifiedNeed) {
      return res.notFound()
    }

    return this.reopenIdentifiedNeed({
      req,
      res,
      next,
      identifiedNeedUuid: identifiedNeed.identifiedNeedUuid!,
    })
  }

  POST = this.deleteJourneyDataAndGoBackToCsipRecordPage
}
