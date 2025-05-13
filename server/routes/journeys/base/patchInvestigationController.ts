import { NextFunction, Request, Response } from 'express'
import { BaseJourneyController } from './controller'
import { getNonUndefinedProp } from '../../../utils/utils'
import { components } from '../../../@types/csip'
import { FLASH_KEY__CSIP_SUCCESS_MESSAGE } from '../../../utils/constants'
import CsipApiService from '../../../services/csipApi/csipApiService'
import AuditService from '../../../services/auditService'

export const MESSAGE_INVESTIGATION_UPDATED = 'You’ve updated the investigation information.'
export const MESSAGE_INTERVIEW_DETAILS_UPDATED = 'You’ve updated the interview details.'
export const MESSAGE_INTERVIEW_ADDED = 'You’ve added an interview.'

type UpdateInvestigationSuccessMessage =
  | typeof MESSAGE_INVESTIGATION_UPDATED
  | typeof MESSAGE_INTERVIEW_DETAILS_UPDATED
  | typeof MESSAGE_INTERVIEW_ADDED

export class PatchInvestigationController extends BaseJourneyController {
  constructor(
    override readonly csipApiService: CsipApiService,
    private readonly auditService: AuditService,
  ) {
    super(csipApiService)
  }

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
      await this.auditService.logModificationApiCall(
        'ATTEMPT',
        'PATCH',
        'INVESTIGATION',
        `/csip-records/${req.journeyData.csipRecord!.recordUuid}/referral/investigation`,
        req.journeyData,
        res.locals.auditEvent,
      )
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
      await this.auditService.logModificationApiCall(
        'SUCCESS',
        'PATCH',
        'INVESTIGATION',
        `/csip-records/${req.journeyData.csipRecord!.recordUuid}/referral/investigation`,
        req.journeyData,
        res.locals.auditEvent,
      )
      next()
    } catch (e) {
      next(e)
    }
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
      await this.auditService.logModificationApiCall(
        'ATTEMPT',
        'POST',
        'INTERVIEW',
        `/csip-records/${req.journeyData.csipRecord!.recordUuid}/referral/investigation/interviews`,
        req.journeyData,
        res.locals.auditEvent,
      )
      await this.csipApiService.addInterview(req as Request, body)
      req.flash(FLASH_KEY__CSIP_SUCCESS_MESSAGE, MESSAGE_INTERVIEW_ADDED)
      await this.auditService.logModificationApiCall(
        'SUCCESS',
        'POST',
        'INTERVIEW',
        `/csip-records/${req.journeyData.csipRecord!.recordUuid}/referral/investigation/interviews`,
        req.journeyData,
        res.locals.auditEvent,
      )
      next()
    } catch (e) {
      next(e)
    }
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
      await this.auditService.logModificationApiCall(
        'ATTEMPT',
        'PATCH',
        'INTERVIEW',
        `/csip-records/referral/investigation/interviews/${interviewUuid}`,
        req.journeyData,
        res.locals.auditEvent,
      )
      await this.csipApiService.updateInterview(req as Request, interviewUuid, body)
      req.flash(FLASH_KEY__CSIP_SUCCESS_MESSAGE, MESSAGE_INTERVIEW_DETAILS_UPDATED)
      await this.auditService.logModificationApiCall(
        'SUCCESS',
        'PATCH',
        'INTERVIEW',
        `/csip-records/referral/investigation/interviews/${interviewUuid}`,
        req.journeyData,
        res.locals.auditEvent,
      )
      next()
    } catch (e) {
      next(e)
    }
  }
}
