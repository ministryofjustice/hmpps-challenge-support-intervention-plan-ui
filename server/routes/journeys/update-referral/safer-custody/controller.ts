import { NextFunction, Request, Response } from 'express'
import { SchemaType } from '../../referral/safer-custody/schemas'
import { MESSAGE_REFERRAL_ADDITIONAL_INFO_UPDATED, PatchReferralController } from '../../base/patchReferralController'

export class UpdateSaferCustodyController extends PatchReferralController {
  GET = async (req: Request, res: Response) => {
    const isSaferCustodyTeamInformed =
      res.locals.formResponses?.['isSaferCustodyTeamInformed'] ?? req.journeyData.referral!.isSaferCustodyTeamInformed

    res.render('referral/safer-custody/view', {
      isSaferCustodyTeamInformed,
      isUpdate: true,
      recordUuid: req.journeyData.csipRecord!.recordUuid,
    })
  }

  checkSubmitToAPI = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) =>
    this.submitChanges({
      req,
      res,
      next,
      changes: { isSaferCustodyTeamInformed: req.body.isSaferCustodyTeamInformed },
      successMessage: MESSAGE_REFERRAL_ADDITIONAL_INFO_UPDATED,
    })

  POST = this.deleteJourneyDataAndGoBackToCsipRecordPage
}
