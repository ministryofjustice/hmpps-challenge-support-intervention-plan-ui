import { NextFunction, Request, Response } from 'express'
import { BaseJourneyController } from './controller'
import { components } from '../../../@types/csip'
import { FLASH_KEY__CSIP_SUCCESS_MESSAGE } from '../../../utils/constants'
import { getNonUndefinedProp } from '../../../utils/utils'
import { IdentifiedNeed } from '../../../@types/express'
import { todayString } from '../../../utils/datetimeUtils'
import CsipApiService from '../../../services/csipApi/csipApiService'
import AuditService from '../../../services/auditService'

const MESSAGE_PLAN_UPDATED = 'You’ve updated the case management information.'
const MESSAGE_IDENTIFIED_NEED_UPDATED = 'You’ve updated the identified needs information.'
const MESSAGE_IDENTIFIED_NEED_CLOSED = 'You’ve closed an identified need in this plan.'
const MESSAGE_IDENTIFIED_NEED_REOPENED = 'You’ve reopened an identified need in this plan.'

export class PatchPlanController extends BaseJourneyController {
  constructor(
    override readonly csipApiService: CsipApiService,
    private readonly auditService: AuditService,
  ) {
    super(csipApiService)
  }

  getSelectedIdentifiedNeed = (req: Request): IdentifiedNeed | undefined => {
    const { identifiedNeedUuid } = req.params
    return req.journeyData.plan!.identifiedNeeds?.find(need => need.identifiedNeedUuid === identifiedNeedUuid)
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
    changes: Partial<components['schemas']['UpdatePlanRequest']>
  }) => {
    const plan = req.journeyData.csipRecord!.plan!

    try {
      await this.auditService.logModificationApiCall(
        'ATTEMPT',
        'UPDATE',
        'PLAN',
        req.originalUrl,
        req.journeyData,
        res.locals.auditEvent,
      )
      await this.csipApiService.updatePlan(req as Request, {
        ...getNonUndefinedProp(plan, 'caseManager'),
        ...getNonUndefinedProp(plan, 'reasonForPlan'),
        ...getNonUndefinedProp(plan, 'nextCaseReviewDate'),
        ...changes,
      })
      req.flash(FLASH_KEY__CSIP_SUCCESS_MESSAGE, MESSAGE_PLAN_UPDATED)
      await this.auditService.logModificationApiCall(
        'SUCCESS',
        'UPDATE',
        'PLAN',
        req.originalUrl,
        req.journeyData,
        res.locals.auditEvent,
      )
      next()
    } catch (e) {
      next(e)
    }
  }

  submitIdentifiedNeedChanges = async <T>({
    req,
    res,
    next,
    identifiedNeedUuid,
    changes,
  }: {
    req: Request<unknown, unknown, T>
    res: Response
    next: NextFunction
    identifiedNeedUuid: string
    changes: Partial<Omit<components['schemas']['UpdateIdentifiedNeedRequest'], 'closedDate'>>
  }) => {
    const identifiedNeed = req.journeyData.csipRecord!.plan!.identifiedNeeds.find(
      need => need.identifiedNeedUuid === identifiedNeedUuid,
    )!

    try {
      await this.auditService.logModificationApiCall(
        'ATTEMPT',
        'UPDATE',
        'IDENTIFIED_NEED',
        req.originalUrl,
        req.journeyData,
        res.locals.auditEvent,
      )
      await this.csipApiService.updateIdentifiedNeed(req as Request, identifiedNeedUuid, {
        ...identifiedNeed,
        ...changes,
      })
      req.flash(FLASH_KEY__CSIP_SUCCESS_MESSAGE, MESSAGE_IDENTIFIED_NEED_UPDATED)
      await this.auditService.logModificationApiCall(
        'SUCCESS',
        'UPDATE',
        'IDENTIFIED_NEED',
        req.originalUrl,
        req.journeyData,
        res.locals.auditEvent,
      )
      next()
    } catch (e) {
      next(e)
    }
  }

  closeIdentifiedNeed = async <T>({
    req,
    res,
    next,
    identifiedNeedUuid,
  }: {
    req: Request<unknown, unknown, T>
    res: Response
    next: NextFunction
    identifiedNeedUuid: string
  }) => {
    const identifiedNeed = req.journeyData.csipRecord!.plan!.identifiedNeeds.find(
      need => need.identifiedNeedUuid === identifiedNeedUuid,
    )!

    try {
      await this.auditService.logModificationApiCall(
        'ATTEMPT',
        'UPDATE',
        'IDENTIFIED_NEED',
        req.originalUrl,
        req.journeyData,
        res.locals.auditEvent,
      )
      await this.csipApiService.updateIdentifiedNeed(req as Request, identifiedNeedUuid, {
        ...identifiedNeed,
        closedDate: todayString(),
      })
      req.flash(FLASH_KEY__CSIP_SUCCESS_MESSAGE, MESSAGE_IDENTIFIED_NEED_CLOSED)
      await this.auditService.logModificationApiCall(
        'SUCCESS',
        'UPDATE',
        'IDENTIFIED_NEED',
        req.originalUrl,
        req.journeyData,
        res.locals.auditEvent,
      )
      next()
    } catch (e) {
      next(e)
    }
  }

  reopenIdentifiedNeed = async <T>({
    req,
    res,
    next,
    identifiedNeedUuid,
  }: {
    req: Request<unknown, unknown, T>
    res: Response
    next: NextFunction
    identifiedNeedUuid: string
  }) => {
    const identifiedNeed = req.journeyData.csipRecord!.plan!.identifiedNeeds.find(
      need => need.identifiedNeedUuid === identifiedNeedUuid,
    )!

    const { closedDate, ...openIdentifiedNeed } = identifiedNeed

    try {
      await this.auditService.logModificationApiCall(
        'ATTEMPT',
        'UPDATE',
        'IDENTIFIED_NEED',
        req.originalUrl,
        req.journeyData,
        res.locals.auditEvent,
      )
      await this.csipApiService.updateIdentifiedNeed(req as Request, identifiedNeedUuid, openIdentifiedNeed)
      req.flash(FLASH_KEY__CSIP_SUCCESS_MESSAGE, MESSAGE_IDENTIFIED_NEED_REOPENED)
      await this.auditService.logModificationApiCall(
        'SUCCESS',
        'UPDATE',
        'IDENTIFIED_NEED',
        req.originalUrl,
        req.journeyData,
        res.locals.auditEvent,
      )
      next()
    } catch (e) {
      next(e)
    }
  }
}
