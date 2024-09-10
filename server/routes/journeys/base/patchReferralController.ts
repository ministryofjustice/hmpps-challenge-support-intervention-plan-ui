import { NextFunction, Request, Response } from 'express'
import { BaseJourneyController } from './controller'
import { SanitisedError } from '../../../sanitisedError'
import { getNonUndefinedProp } from '../../../utils/utils'
import { components } from '../../../@types/csip'
import { CSIP_SUCCESS_MESSAGE } from '../../../utils/constants'

export const MESSAGE_REFERRAL_DETAILS_UPDATED = 'You’ve updated the referral details.'
export const MESSAGE_REACTIVE_DETAILS_UPDATED = 'You’ve updated the incident details.'
export const MESSAGE_PROACTIVE_DETAILS_UPDATED = 'You’ve updated the behaviour details.'
export const MESSAGE_REACTIVE_INVOLVEMENT_UPDATED = 'You’ve updated the incident involvement information.'
export const MESSAGE_PROACTIVE_INVOLVEMENT_UPDATED = 'You’ve updated the behaviour involvement information.'
export const MESSAGE_REACTIVE_DESCRIPTION_UPDATED = 'You’ve updated the incident description.'
export const MESSAGE_PROACTIVE_DESCRIPTION_UPDATED = 'You’ve updated the behaviour description.'
export const MESSAGE_CONTRIBUTORY_FACTOR_UPDATED = 'You’ve updated the information on contributory factors.'
export const MESSAGE_REFERRAL_ADDITIONAL_INFO_UPDATED = 'You’ve updated the additional information.'

type UpdateReferralSuccessMessage =
  | typeof MESSAGE_REFERRAL_DETAILS_UPDATED
  | typeof MESSAGE_REACTIVE_DETAILS_UPDATED
  | typeof MESSAGE_PROACTIVE_DETAILS_UPDATED
  | typeof MESSAGE_REACTIVE_INVOLVEMENT_UPDATED
  | typeof MESSAGE_PROACTIVE_INVOLVEMENT_UPDATED
  | typeof MESSAGE_REACTIVE_DESCRIPTION_UPDATED
  | typeof MESSAGE_PROACTIVE_DESCRIPTION_UPDATED
  | typeof MESSAGE_CONTRIBUTORY_FACTOR_UPDATED
  | typeof MESSAGE_REFERRAL_ADDITIONAL_INFO_UPDATED

export class PatchReferralController extends BaseJourneyController {
  submitChanges = async <T>({
    req,
    res,
    next,
    changes,
    successMessage,
  }: {
    req: Request<unknown, unknown, T>
    res: Response
    next: NextFunction
    changes: Partial<components['schemas']['UpdateReferral']>
    successMessage: UpdateReferralSuccessMessage
  }) => {
    const csipRecord = req.journeyData.csipRecord!

    try {
      await this.csipApiService.updateCsipRecord(req as Request, {
        ...getNonUndefinedProp(csipRecord, 'logCode'),
        referral: {
          incidentDate: csipRecord.referral.incidentDate,
          referredBy: csipRecord.referral.referredBy,
          isSaferCustodyTeamInformed: csipRecord.referral.isSaferCustodyTeamInformed,
          refererAreaCode: csipRecord.referral.refererArea.code,
          incidentLocationCode: csipRecord.referral.incidentLocation.code,
          incidentTypeCode: csipRecord.referral.incidentType.code,
          ...getNonUndefinedProp(csipRecord.referral, 'incidentDate'),
          ...getNonUndefinedProp(csipRecord.referral, 'incidentTime'),
          ...getNonUndefinedProp(csipRecord.referral, 'isProactiveReferral'),
          ...getNonUndefinedProp(csipRecord.referral, 'isStaffAssaulted'),
          ...getNonUndefinedProp(csipRecord.referral, 'assaultedStaffName'),
          ...getNonUndefinedProp(csipRecord.referral, 'descriptionOfConcern'),
          ...getNonUndefinedProp(csipRecord.referral, 'knownReasons'),
          ...getNonUndefinedProp(csipRecord.referral, 'otherInformation'),
          ...getNonUndefinedProp(csipRecord.referral, 'isReferralComplete'),
          ...(csipRecord.referral.incidentInvolvement
            ? { incidentInvolvementCode: csipRecord.referral.incidentInvolvement?.code }
            : {}),
          ...changes,
        },
      })
    } catch (e) {
      if ((e as SanitisedError).data) {
        const errorRespData = (e as SanitisedError).data as Record<string, string | unknown>
        req.flash(
          'validationErrors',
          JSON.stringify({
            referral: [errorRespData?.['userMessage'] as string],
          }),
        )
      }
      res.redirect('back')
      return
    }
    req.flash(CSIP_SUCCESS_MESSAGE, successMessage)
    next()
  }
}
