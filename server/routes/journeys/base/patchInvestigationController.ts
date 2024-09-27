import { NextFunction, Request } from 'express'
import { BaseJourneyController } from './controller'
import { getNonUndefinedProp } from '../../../utils/utils'
import { components } from '../../../@types/csip'
import { FLASH_KEY__CSIP_SUCCESS_MESSAGE } from '../../../utils/constants'

export const MESSAGE_INVESTIGATION_UPDATED = 'You’ve updated the investigation information.'
export const MESSAGE_INTERVIEW_DETAILS_UPDATED = 'You’ve updated the interview details.'
export const MESSAGE_INTERVIEW_ADDED = 'You’ve added an interview.'

type UpdateInvestigationSuccessMessage =
  | typeof MESSAGE_INVESTIGATION_UPDATED
  | typeof MESSAGE_INTERVIEW_DETAILS_UPDATED
  | typeof MESSAGE_INTERVIEW_ADDED

export class PatchInvestigationController extends BaseJourneyController {
  submitChanges = async <T>({
    req,
    next,
    changes,
    successMessage,
  }: {
    req: Request<unknown, unknown, T>
    next: NextFunction
    changes: Partial<components['schemas']['UpdateInvestigationRequest']>
    successMessage: UpdateInvestigationSuccessMessage
  }) => {
    const csipRecord = req.journeyData.csipRecord!

    try {
      await this.csipApiService.updateInvestigation(req as Request, {
        ...getNonUndefinedProp(csipRecord.referral.investigation!, 'staffInvolved'),
        ...getNonUndefinedProp(csipRecord.referral.investigation!, 'evidenceSecured'),
        ...getNonUndefinedProp(csipRecord.referral.investigation!, 'occurrenceReason'),
        ...getNonUndefinedProp(csipRecord.referral.investigation!, 'personsUsualBehaviour'),
        ...getNonUndefinedProp(csipRecord.referral.investigation!, 'personsTrigger'),
        ...getNonUndefinedProp(csipRecord.referral.investigation!, 'protectiveFactors'),
        ...changes,
      })
      req.flash(FLASH_KEY__CSIP_SUCCESS_MESSAGE, successMessage)
      next()
    } catch (e) {
      next(e)
    }
  }

  addInterview = async <T>({
    req,
    next,
    body,
  }: {
    req: Request<Record<string, string>, unknown, T>
    next: NextFunction
    body: components['schemas']['CreateInterviewRequest']
  }) => {
    try {
      await this.csipApiService.addInterview(req as Request, body)
      req.flash(FLASH_KEY__CSIP_SUCCESS_MESSAGE, MESSAGE_INTERVIEW_ADDED)
      next()
    } catch (e) {
      next(e)
    }
  }

  updateInterview = async <T>({
    req,
    next,
    body,
    interviewUuid,
  }: {
    req: Request<Record<string, string>, unknown, T>
    next: NextFunction
    body: components['schemas']['UpdateInterviewRequest']
    interviewUuid: string
  }) => {
    try {
      await this.csipApiService.updateInterview(req as Request, interviewUuid, body)
      req.flash(FLASH_KEY__CSIP_SUCCESS_MESSAGE, MESSAGE_INTERVIEW_DETAILS_UPDATED)
      next()
    } catch (e) {
      next(e)
    }
  }
}
