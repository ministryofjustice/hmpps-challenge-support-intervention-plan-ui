import { NextFunction, Request, Response } from 'express'
import { PatchReviewController } from '../../base/patchReviewController'

export class UpdateCloseCsipController extends PatchReviewController {
  GET = async (req: Request, res: Response) => {
    res.render('record-review/close-csip/view', {
      isUpdate: true,
      backUrl: `outcome`,
      recordUuid: req.journeyData.csipRecord!.recordUuid,
      openIdentifiedNeeds: (req.journeyData.csipRecord?.plan?.identifiedNeeds || []).filter(o => !o.closedDate).length,
    })
  }

  checkSubmitToAPI = async (req: Request<unknown, unknown, unknown>, res: Response, next: NextFunction) =>
    this.submitChanges({
      req,
      res,
      next,
      changes: {
        actions: ['CLOSE_CSIP'],
      },
      message: 'You’ve updated the review outcome and closed the CSIP.',
    })

  POST = async (req: Request, res: Response) => {
    res.redirect(`/csip-records/${req.journeyData.csipRecord!.recordUuid}`)
  }
}
