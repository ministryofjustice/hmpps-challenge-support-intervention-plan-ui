import { NextFunction, Request } from 'express'
import { getNonUndefinedProp } from '../../../utils/utils'
import { components } from '../../../@types/csip'
import { PatchCsipRecordController } from './patchCsipRecordController'

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

export class PatchReferralController extends PatchCsipRecordController {
  submitChanges = async <T>({
    req,
    next,
    changes,
    successMessage,
  }: {
    req: Request<unknown, unknown, T>
    next: NextFunction
    changes: Partial<components['schemas']['UpdateReferralRequest']>
    successMessage: UpdateReferralSuccessMessage
  }) =>
    this.submitCsipChanges({
      req,
      next,
      successMessage,
      changes: {
        ...getNonUndefinedProp(req.journeyData.csipRecord!, 'logCode'),
        referral: changes,
      },
    })
}
