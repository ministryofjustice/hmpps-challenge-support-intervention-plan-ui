import { NextFunction, Request, Response } from 'express'
import { SchemaType } from '../referrer/schemas'
import { MESSAGE_REFERRAL_DETAILS_UPDATED, PatchReferralController } from '../../base/patchReferralController'

export class UpdateReferrerController extends PatchReferralController {
  checkSubmitToAPI = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) => {
    const referral = req.journeyData.referral!
    const prisoner = req.journeyData.prisoner!
    this.submitChanges({
      req,
      res,
      next,
      changes: {
        referral: {
          contributoryFactors: referral.contributoryFactors!.map(factor => ({
            factorTypeCode: factor.factorType.code,
            ...(factor.comment !== undefined && { comment: factor.comment }),
          })),
          incidentDate: referral.incidentDate!,
          incidentLocationCode: referral.incidentLocation!.code,
          incidentTypeCode: referral.incidentType!.code,
          refererAreaCode: referral.refererArea!.code,
          referredBy: referral.referredBy!,
          ...(typeof referral.assaultedStaffName === 'string' && { assaultedStaffName: referral.assaultedStaffName }),
          descriptionOfConcern: referral.descriptionOfConcern!,
          incidentInvolvementCode: referral.incidentInvolvement!.code,
          ...(referral.incidentTime && { incidentTime: referral.incidentTime }),
          isProactiveReferral: referral.isProactiveReferral!,
          isSaferCustodyTeamInformed: referral.isSaferCustodyTeamInformed!,
          isReferralComplete: true,
          isStaffAssaulted: referral.isStaffAssaulted!,
          knownReasons: referral.knownReasons!,
          ...(typeof referral.otherInformation === 'string' && { otherInformation: referral.otherInformation }),
        },
      },
      successMessage: MESSAGE_REFERRAL_DETAILS_UPDATED,
    })
  }

  POST = async (req: Request, res: Response) => {
    res.redirect(`/csip-records/${req.journeyData.csipRecord!.recordUuid}`)
  }
}
