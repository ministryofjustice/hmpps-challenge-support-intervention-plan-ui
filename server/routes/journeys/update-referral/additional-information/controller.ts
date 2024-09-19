import { NextFunction, Request, Response } from 'express'
import { SchemaType } from './schemas'
import { MESSAGE_REFERRAL_ADDITIONAL_INFO_UPDATED, PatchReferralController } from '../../base/patchReferralController'
import { generateSaveTimestamp, getMaxCharsAndThresholdForAppend } from '../../../../utils/appendFieldUtils'

export class UpdateAdditionalInfoController extends PatchReferralController {
  GET = async (req: Request, res: Response) => {
    res.render('referral/additional-information/view', {
      currentOtherInformation: req.journeyData.referral!.otherInformation,
      otherInformation: res.locals.formResponses?.['otherInformation'],
      isUpdate: true,
      recordUuid: req.journeyData.csipRecord!.recordUuid,
      ...getMaxCharsAndThresholdForAppend(res.locals.user.displayName, req.journeyData.referral!.otherInformation),
    })
  }

  checkSubmitToAPI = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) =>
    this.submitChanges({
      req,
      res,
      next,
      changes: {
        otherInformation:
          req.journeyData.referral!.otherInformation +
          generateSaveTimestamp(res.locals.user.displayName) +
          req.body.otherInformation,
      },
      successMessage: MESSAGE_REFERRAL_ADDITIONAL_INFO_UPDATED,
    })

  POST = async (req: Request, res: Response) => {
    res.redirect(`/csip-records/${req.journeyData.csipRecord!.recordUuid}`)
  }
}
