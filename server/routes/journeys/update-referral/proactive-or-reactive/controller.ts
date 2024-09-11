import { NextFunction, Request, Response } from 'express'
import { SchemaType } from '../../referral/proactive-or-reactive/schemas'
import { MESSAGE_REFERRAL_DETAILS_UPDATED, PatchReferralController } from '../../base/patchReferralController'

export class UpdateProactiveOrReactiveController extends PatchReferralController {
  GET = async (req: Request, res: Response) => {
    res.render('referral/proactive-or-reactive/view', {
      isProactiveReferral: Boolean(req.journeyData.csipRecord!.referral.isProactiveReferral),
      isUpdate: true,
      recordUuid: req.journeyData.csipRecord!.recordUuid,
    })
  }

  checkSubmitToAPI = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) =>
    this.submitChanges({
      req,
      res,
      next,
      changes: { isProactiveReferral: req.body.isProactiveReferral },
      successMessage: MESSAGE_REFERRAL_DETAILS_UPDATED,
    })

  POST = async (req: Request, res: Response) => {
    res.redirect(`/csip-records/${req.journeyData.csipRecord!.recordUuid}`)
  }
}
