import { NextFunction, Request, Response } from 'express'
import { SchemaType } from '../../referral/referrer/schemas'
import { MESSAGE_REFERRAL_DETAILS_UPDATED, PatchReferralController } from '../../base/patchReferralController'

export class UpdateReferrerController extends PatchReferralController {
  GET = async (req: Request, res: Response) => {
    const areaOfWorkOptions = await this.getReferenceDataOptionsForSelect(
      req,
      'area-of-work',
      'Select area',
      res.locals.formResponses?.['areaOfWork'] ?? req.journeyData.csipRecord!.referral.refererArea,
    )

    res.render('referral/referrer/view', {
      areaOfWorkOptions,
      referredBy: res.locals.formResponses?.['referredBy'] ?? req.journeyData.csipRecord!.referral.referredBy,
      flowName: 'Update a CSIP referral',
      isUpdate: true,
      recordUuid: req.journeyData.csipRecord!.recordUuid,
    })
  }

  checkSubmitToAPI = async (req: Request<unknown, unknown, SchemaType>, _res: Response, next: NextFunction) =>
    this.submitChanges({
      req,
      next,
      changes: { referredBy: req.body.referredBy, refererAreaCode: req.body.areaOfWork.code },
      successMessage: MESSAGE_REFERRAL_DETAILS_UPDATED,
    })

  POST = async (req: Request, res: Response) => {
    res.redirect(`/csip-records/${req.journeyData.csipRecord!.recordUuid}`)
  }
}
