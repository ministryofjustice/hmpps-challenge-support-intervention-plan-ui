import { NextFunction, Request, Response } from 'express'
import { BaseJourneyController } from './controller'
import { getNonUndefinedProp } from '../../../utils/utils'
import { components } from '../../../@types/csip'
import { FLASH_KEY__CSIP_SUCCESS_MESSAGE } from '../../../utils/constants'
import CsipApiService from '../../../services/csipApi/csipApiService'
import AuditService from '../../../services/auditService'

export const MESSAGE_DECISION_UPDATED = 'You’ve updated the information about the investigation decision.'

export class PatchDecisionController extends BaseJourneyController {
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
  }: {
    req: Request<unknown, unknown, T>
    res: Response
    next: NextFunction
    changes: Partial<components['schemas']['UpsertDecisionAndActionsRequest']>
  }) => {
    const decision = req.journeyData.csipRecord!.referral.decisionAndActions!

    try {
      await this.auditService.logModificationApiCall(
        'ATTEMPT',
        'PUT',
        'DECISION_AND_ACTIONS',
        `/csip-records/${req.journeyData.csipRecord!.recordUuid}/referral/decision-and-actions`,
        req.journeyData,
        res.locals.auditEvent,
      )

      await this.csipApiService.upsertDecision(req as Request, {
        outcomeTypeCode: decision.outcome!.code,
        ...getNonUndefinedProp(decision.signedOffByRole!, 'code', 'signedOffByRoleCode'),
        actions: decision.actions,
        ...getNonUndefinedProp(decision, 'date'),
        ...getNonUndefinedProp(decision, 'recordedBy'),
        ...getNonUndefinedProp(decision, 'recordedByDisplayName'),
        ...getNonUndefinedProp(decision, 'conclusion'),
        ...getNonUndefinedProp(decision, 'actionOther'),
        ...getNonUndefinedProp(decision, 'nextSteps'),
        ...changes,
      })
      req.flash(FLASH_KEY__CSIP_SUCCESS_MESSAGE, MESSAGE_DECISION_UPDATED)
      await this.auditService.logModificationApiCall(
        'SUCCESS',
        'PUT',
        'DECISION_AND_ACTIONS',
        `/csip-records/${req.journeyData.csipRecord!.recordUuid}/referral/decision-and-actions`,
        req.journeyData,
        res.locals.auditEvent,
      )
      next()
    } catch (e) {
      next(e)
    }
  }
}
