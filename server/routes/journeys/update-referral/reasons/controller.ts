import { NextFunction, Request, Response } from 'express'
import { SchemaType } from '../../referral/reasons/schemas'
import { MESSAGE_REFERRAL_DETAILS_UPDATED, PatchReferralController } from '../../base/patchReferralController'
import { generateSaveTimestamp, getMaxCharsAndThresholdForAppend } from '../../../../utils/appendFieldUtils'

export class UpdateReasonsController extends PatchReferralController {
  GET = async (req: Request, res: Response) => {
    res.render('referral/reasons/view', {
      isProactiveReferral: req.journeyData.csipRecord!.referral.isProactiveReferral,
      currentKnownReasons: req.journeyData.csipRecord!.referral.knownReasons,
      knownReasons: res.locals.formResponses?.['knownReasons'],
      isUpdate: true,
      recordUuid: req.journeyData.csipRecord!.recordUuid,
      ...getMaxCharsAndThresholdForAppend(
        res.locals.user.displayName,
        req.journeyData.csipRecord!.referral.knownReasons,
      ),
    })
  }

  checkSubmitToAPI = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) =>
    this.submitChanges({
      req,
      res,
      next,
      changes: {
        knownReasons:
          req.journeyData.referral!.knownReasons +
          generateSaveTimestamp(res.locals.user.displayName) +
          req.body.knownReasons,
      },
      successMessage: MESSAGE_REFERRAL_DETAILS_UPDATED,
    })

  POST = async (req: Request, res: Response) => {
    res.redirect(`/csip-records/${req.journeyData.csipRecord!.recordUuid}`)
  }
}
