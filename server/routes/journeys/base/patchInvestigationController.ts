import { NextFunction, Request, Response } from 'express'
import { BaseJourneyController } from './controller'
import { SanitisedError } from '../../../sanitisedError'
import { getNonUndefinedProp } from '../../../utils/utils'
import { components } from '../../../@types/csip'
import { FLASH_KEY__CSIP_SUCCESS_MESSAGE, FLASH_KEY__VALIDATION_ERRORS } from '../../../utils/constants'

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
    res,
    next,
    changes,
    successMessage,
  }: {
    req: Request<unknown, unknown, T>
    res: Response
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
    } catch (e) {
      if ((e as SanitisedError).data) {
        const errorRespData = (e as SanitisedError).data as Record<string, string | unknown>
        req.flash(
          FLASH_KEY__VALIDATION_ERRORS,
          JSON.stringify({
            referral: [errorRespData?.['userMessage'] as string],
          }),
        )
      }
      res.redirect('back')
      return
    }
    req.flash(FLASH_KEY__CSIP_SUCCESS_MESSAGE, successMessage)
    next()
  }

  addInterview = async <T>({
    req,
    res,
    next,
    body,
  }: {
    req: Request<Record<string, string>, unknown, T>
    res: Response
    next: NextFunction
    body: components['schemas']['CreateInterviewRequest']
  }) => {
    try {
      await this.csipApiService.addInterview(req as Request, body)
    } catch (e) {
      if ((e as SanitisedError).data) {
        const errorRespData = (e as SanitisedError).data as Record<string, string | unknown>
        req.flash(
          FLASH_KEY__VALIDATION_ERRORS,
          JSON.stringify({
            referral: [errorRespData?.['userMessage'] as string],
          }),
        )
      }
      res.redirect('back')
      return
    }
    req.flash(FLASH_KEY__CSIP_SUCCESS_MESSAGE, MESSAGE_INTERVIEW_ADDED)
    next()
  }

  updateInterview = async <T>({
    req,
    res,
    next,
    body,
    interviewUuid,
  }: {
    req: Request<Record<string, string>, unknown, T>
    res: Response
    next: NextFunction
    body: components['schemas']['UpdateInterviewRequest']
    interviewUuid: string
  }) => {
    try {
      await this.csipApiService.updateInterview(req as Request, interviewUuid, body)
    } catch (e) {
      if ((e as SanitisedError).data) {
        const errorRespData = (e as SanitisedError).data as Record<string, string | unknown>
        req.flash(
          FLASH_KEY__VALIDATION_ERRORS,
          JSON.stringify({
            referral: [errorRespData?.['userMessage'] as string],
          }),
        )
      }
      res.redirect('back')
      return
    }
    req.flash(FLASH_KEY__CSIP_SUCCESS_MESSAGE, MESSAGE_INTERVIEW_DETAILS_UPDATED)
    next()
  }
}
