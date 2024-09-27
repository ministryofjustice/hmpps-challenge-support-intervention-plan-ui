import { NextFunction, Request } from 'express'
import { BaseJourneyController } from './controller'
import { getNonUndefinedProp } from '../../../utils/utils'
import { components } from '../../../@types/csip'
import { FLASH_KEY__CSIP_SUCCESS_MESSAGE } from '../../../utils/constants'

export const MESSAGE_DECISION_UPDATED = 'You’ve updated the information about the investigation decision.'

export class PatchDecisionController extends BaseJourneyController {
  submitChanges = async <T>({
    req,
    next,
    changes,
  }: {
    req: Request<unknown, unknown, T>
    next: NextFunction
    changes: Partial<components['schemas']['UpsertDecisionAndActionsRequest']>
  }) => {
    const decision = req.journeyData.csipRecord!.referral.decisionAndActions!

    try {
      await this.csipApiService.createDecision(req as Request, {
        outcomeTypeCode: decision.outcome!.code,
        signedOffByRoleCode: decision.signedOffByRole!.code,
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
      next()
    } catch (e) {
      next(e)
    }
  }
}
