import { NextFunction, Request, Response } from 'express'
import { SchemaType } from '../../referral/involvement/schemas'
import {
  MESSAGE_PROACTIVE_INVOLVEMENT_UPDATED,
  MESSAGE_REACTIVE_INVOLVEMENT_UPDATED,
  PatchReferralController,
} from '../../base/patchReferralController'
import { getNonUndefinedProp } from '../../../../utils/utils'

export class UpdateInvolvementController extends PatchReferralController {
  GET = async (req: Request, res: Response) => {
    const items = await this.getReferenceDataOptionsForRadios(
      req,
      'incident-involvement',
      res.locals.formResponses?.['involvementType'] ?? req.journeyData.csipRecord!.referral.incidentInvolvement,
    )
    // Differentiate between not set, false and true
    const formResponsesStaffAssaulted =
      res.locals.formResponses?.['isStaffAssaulted'] === undefined
        ? undefined
        : res.locals.formResponses?.['isStaffAssaulted'] === 'true'

    res.render('referral/involvement/view', {
      involvementTypeItems: items,
      isProactiveReferral: req.journeyData.referral!.isProactiveReferral,
      isStaffAssaulted: formResponsesStaffAssaulted ?? req.journeyData.referral!.isStaffAssaulted,
      assaultedStaffName:
        res.locals.formResponses?.['assaultedStaffName'] ?? req.journeyData.referral!.assaultedStaffName,
      isUpdate: true,
      recordUuid: req.journeyData.csipRecord!.recordUuid,
    })
  }

  checkSubmitToAPI = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) =>
    this.submitChanges({
      req,
      res,
      next,
      changes: {
        incidentInvolvementCode: req.body.involvementType.code,
        isStaffAssaulted: req.body.isStaffAssaulted,
        ...getNonUndefinedProp(req.body, 'assaultedStaffName'),
      },
      successMessage: req.journeyData.referral!.isProactiveReferral
        ? MESSAGE_PROACTIVE_INVOLVEMENT_UPDATED
        : MESSAGE_REACTIVE_INVOLVEMENT_UPDATED,
    })

  POST = this.deleteJourneyDataAndGoBackToCsipRecordPage
}
