import { NextFunction, Request, Response } from 'express'
import { SchemaType } from '../../referral/reasons/schemas'
import {
  MESSAGE_PROACTIVE_DESCRIPTION_UPDATED,
  MESSAGE_REACTIVE_DESCRIPTION_UPDATED,
  PatchReferralController,
} from '../../base/patchReferralController'
import { getMaxCharsAndThresholdForAppend, getTextForApiSubmission } from '../../../../utils/appendFieldUtils'

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
        knownReasons: getTextForApiSubmission(
          req.journeyData.referral!.knownReasons,
          res.locals.user.displayName,
          req.body.knownReasons,
        ),
      },
      successMessage: req.journeyData.referral?.isProactiveReferral
        ? MESSAGE_PROACTIVE_DESCRIPTION_UPDATED
        : MESSAGE_REACTIVE_DESCRIPTION_UPDATED,
    })

  POST = async (req: Request, res: Response) => {
    res.redirect(`/csip-records/${req.journeyData.csipRecord!.recordUuid}`)
  }
}
