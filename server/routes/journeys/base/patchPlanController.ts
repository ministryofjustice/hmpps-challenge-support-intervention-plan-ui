import { NextFunction, Request } from 'express'
import { BaseJourneyController } from './controller'
import { components } from '../../../@types/csip'
import { FLASH_KEY__CSIP_SUCCESS_MESSAGE } from '../../../utils/constants'
import { getNonUndefinedProp } from '../../../utils/utils'

const MESSAGE_IDENTIFIED_NEED_UPDATED = 'You’ve updated the identified needs information.'

export class PatchPlanController extends BaseJourneyController {
  submitChanges = async <T>({
    req,
    next,
    changes,
    successMessage,
  }: {
    req: Request<unknown, unknown, T>
    next: NextFunction
    changes: Partial<components['schemas']['UpdatePlanRequest']>
    successMessage: string
  }) => {
    const plan = req.journeyData.csipRecord!.plan!

    try {
      await this.csipApiService.updatePlan(req as Request, {
        ...getNonUndefinedProp(plan!, 'caseManager'),
        ...getNonUndefinedProp(plan!, 'reasonForPlan'),
        ...getNonUndefinedProp(plan!, 'firstCaseReviewDate'),
        ...getNonUndefinedProp(plan!, 'reviews'),
        ...getNonUndefinedProp(plan!, 'identifiedNeeds'),
        ...changes,
      })
      req.flash(FLASH_KEY__CSIP_SUCCESS_MESSAGE, successMessage)
      next()
    } catch (e) {
      next(e)
    }
  }

  submitIdentifiedNeedChanges = async <T>({
    req,
    next,
    identifiedNeedUuid,
    changes,
  }: {
    req: Request<unknown, unknown, T>
    next: NextFunction
    identifiedNeedUuid: string
    changes: Partial<Omit<components['schemas']['UpdateIdentifiedNeedRequest'], 'closedDate'>>
  }) => {
    const identifiedNeed = req.journeyData.csipRecord!.plan!.identifiedNeeds.find(
      need => need.identifiedNeedUuid === identifiedNeedUuid,
    )!

    try {
      await this.csipApiService.updateIdentifiedNeed(req as Request, identifiedNeedUuid, {
        ...identifiedNeed,
        ...changes,
      })
      req.flash(FLASH_KEY__CSIP_SUCCESS_MESSAGE, MESSAGE_IDENTIFIED_NEED_UPDATED)
      next()
    } catch (e) {
      next(e)
    }
  }
}
