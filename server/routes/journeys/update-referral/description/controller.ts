import { NextFunction, Request, Response } from 'express'
import { SchemaType } from '../../referral/description/schemas'
import { MESSAGE_REFERRAL_DETAILS_UPDATED, PatchReferralController } from '../../base/patchReferralController'
import { generateSaveTimestamp, getMaxCharsAndThreshold } from '../../../../utils/appendFieldUtils'

export class UpdateDescriptionController extends PatchReferralController {
  GET = async (req: Request, res: Response) => {
    res.render('referral/description/view', {
      isProactiveReferral: req.journeyData.csipRecord!.referral.isProactiveReferral,
      currentDescriptionOfConcern: req.journeyData.csipRecord!.referral.descriptionOfConcern,
      descriptionOfConcern: res.locals.formResponses?.['descriptionOfConcern'],
      isUpdate: true,
      recordUuid: req.journeyData.csipRecord!.recordUuid,
      ...getMaxCharsAndThreshold(req, req.journeyData.csipRecord!.referral.descriptionOfConcern),
    })
  }

  checkSubmitToAPI = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) =>
    this.submitChanges({
      req,
      res,
      next,
      changes: {
        descriptionOfConcern: generateSaveTimestamp(req.journeyData.prisoner!) + req.body.descriptionOfConcern,
      },
      successMessage: MESSAGE_REFERRAL_DETAILS_UPDATED,
    })

  POST = async (req: Request, res: Response) => {
    res.redirect(`/csip-records/${req.journeyData.csipRecord!.recordUuid}`)
  }
}
