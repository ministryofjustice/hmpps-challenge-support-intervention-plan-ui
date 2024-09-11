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
      res.locals.formResponses?.['involvementType'] || req.journeyData.csipRecord!.referral.incidentInvolvement,
    )
    // Differentiate between not set, false and true
    const formResponsesStaffAssaulted =
      res.locals.formResponses?.['staffAssaulted'] === undefined
        ? undefined
        : res.locals.formResponses?.['staffAssaulted'] === 'true'

    res.render('referral/involvement/view', {
      involvementTypeItems: items,
      isProactiveReferral: Boolean(req.journeyData.csipRecord!.referral.isProactiveReferral),
      staffAssaulted: formResponsesStaffAssaulted ?? req.journeyData.csipRecord!.referral.isStaffAssaulted,
      assaultedStaffName:
        res.locals.formResponses?.['assaultedStaffName'] || req.journeyData.csipRecord!.referral.assaultedStaffName,
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
        isStaffAssaulted: req.body.staffAssaulted,
        ...getNonUndefinedProp(req.body, 'assaultedStaffName'),
      },
      successMessage: req.journeyData.csipRecord!.referral.isProactiveReferral
        ? MESSAGE_PROACTIVE_INVOLVEMENT_UPDATED
        : MESSAGE_REACTIVE_INVOLVEMENT_UPDATED,
    })

  POST = async (req: Request, res: Response) => {
    res.redirect(`/csip-records/${req.journeyData.csipRecord!.recordUuid}`)
  }
}
