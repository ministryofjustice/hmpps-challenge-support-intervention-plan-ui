import { NextFunction, Request, Response } from 'express'
import { SchemaType } from '../../referral/description/schemas'
import {
  MESSAGE_PROACTIVE_DESCRIPTION_UPDATED,
  MESSAGE_REACTIVE_DESCRIPTION_UPDATED,
  PatchReferralController,
} from '../../base/patchReferralController'
import { getMaxCharsAndThresholdForAppend, getTextForApiSubmission } from '../../../../utils/appendFieldUtils'

export class UpdateDescriptionController extends PatchReferralController {
  GET = async (req: Request, res: Response) => {
    res.render('referral/description/view', {
      isProactiveReferral: req.journeyData.csipRecord!.referral.isProactiveReferral,
      currentDescriptionOfConcern: req.journeyData.csipRecord!.referral.descriptionOfConcern,
      descriptionOfConcern: res.locals.formResponses?.['descriptionOfConcern'],
      isUpdate: true,
      recordUuid: req.journeyData.csipRecord!.recordUuid,
      ...getMaxCharsAndThresholdForAppend(
        res.locals.user.displayName,
        req.journeyData.csipRecord!.referral.descriptionOfConcern,
      ),
    })
  }

  checkSubmitToAPI = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) =>
    this.submitChanges({
      req,
      res,
      next,
      changes: {
        descriptionOfConcern: getTextForApiSubmission(
          req.journeyData.referral!.descriptionOfConcern,
          res.locals.user.displayName,
          req.body.descriptionOfConcern,
        ),
      },
      successMessage: req.journeyData.referral?.isProactiveReferral
        ? MESSAGE_PROACTIVE_DESCRIPTION_UPDATED
        : MESSAGE_REACTIVE_DESCRIPTION_UPDATED,
    })

  POST = this.deleteJourneyDataAndGoBackToCsipRecordPage
}
