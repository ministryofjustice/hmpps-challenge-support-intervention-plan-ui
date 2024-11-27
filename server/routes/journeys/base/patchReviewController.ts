import { NextFunction, Request, Response } from 'express'
import { format } from 'date-fns'
import { BaseJourneyController } from './controller'
import { components } from '../../../@types/csip'
import { FLASH_KEY__CSIP_SUCCESS_MESSAGE } from '../../../utils/constants'
import { getNonUndefinedProp } from '../../../utils/utils'
import CsipApiService from '../../../services/csipApi/csipApiService'
import AuditService from '../../../services/auditService'

export const MESSAGE_REVIEW_UPDATED = 'You’ve updated the review details.'
export const MESSAGE_MOST_RECENT_REVIEW_UPDATED = 'You’ve updated the review details for the most recent review.'
const MESSAGE_ADDED_ATTENDEE = 'You’ve added a new participant.'

export class PatchReviewController extends BaseJourneyController {
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
    message,
  }: {
    req: Request<unknown, unknown, T>
    res: Response
    next: NextFunction
    changes: Partial<components['schemas']['UpdateReviewRequest']>
    message: string
  }) => {
    const review = req.journeyData.csipRecord!.plan!.reviews.reduce(
      (prev, cur) => (prev!.reviewSequence > cur.reviewSequence ? prev : cur),
      req.journeyData.csipRecord!.plan!.reviews[0],
    )!

    const payload = {
      recordedBy: review.recordedBy,
      recordedByDisplayName: review.recordedByDisplayName,
      reviewDate: review.reviewDate,
      ...getNonUndefinedProp(review, 'nextReviewDate'),
      ...getNonUndefinedProp(review, 'summary'),
      ...getNonUndefinedProp(review, 'csipClosedDate'),
      actions: (review.csipClosedDate ? ['CLOSE_CSIP'] : ['REMAIN_ON_CSIP']) as (
        | 'RESPONSIBLE_PEOPLE_INFORMED'
        | 'CSIP_UPDATED'
        | 'REMAIN_ON_CSIP'
        | 'CASE_NOTE'
        | 'CLOSE_CSIP'
      )[],
      ...changes,
    }

    if (payload.actions.includes('CLOSE_CSIP')) {
      delete payload.nextReviewDate
      if (!payload.csipClosedDate) {
        payload.csipClosedDate = format(new Date(), 'yyyy-MM-dd')
      }
    }
    if (payload.actions.includes('REMAIN_ON_CSIP')) {
      delete payload.csipClosedDate
    }

    try {
      await this.auditService.logModificationApiCall(
        'ATTEMPT',
        'UPDATE',
        'REVIEW',
        req.originalUrl,
        req.journeyData,
        res.locals.auditEvent,
      )
      await this.csipApiService.updateReview(req as Request, payload)
      req.flash(FLASH_KEY__CSIP_SUCCESS_MESSAGE, message)
      await this.auditService.logModificationApiCall(
        'SUCCESS',
        'UPDATE',
        'REVIEW',
        req.originalUrl,
        req.journeyData,
        res.locals.auditEvent,
      )
      next()
    } catch (e) {
      next(e)
    }
  }

  addNewAttendee = async <T>({
    req,
    res,
    next,
    changes,
  }: {
    req: Request<unknown, unknown, T>
    res: Response
    next: NextFunction
    changes: components['schemas']['CreateAttendeeRequest']
  }) => {
    try {
      await this.auditService.logModificationApiCall(
        'ATTEMPT',
        'CREATE',
        'ATTENDEE',
        req.originalUrl,
        req.journeyData,
        res.locals.auditEvent,
      )
      await this.csipApiService.addNewAttendee(req as Request, changes)
      req.flash(FLASH_KEY__CSIP_SUCCESS_MESSAGE, MESSAGE_ADDED_ATTENDEE)
      await this.auditService.logModificationApiCall(
        'SUCCESS',
        'CREATE',
        'ATTENDEE',
        req.originalUrl,
        req.journeyData,
        res.locals.auditEvent,
      )
      next()
    } catch (e) {
      next(e)
    }
  }

  submitAttendeeChanges = async <T>({
    req,
    res,
    next,
    attendeeUuid,
    changes,
  }: {
    req: Request<unknown, unknown, T>
    res: Response
    next: NextFunction
    attendeeUuid: string
    changes: components['schemas']['UpdateAttendeeRequest']
  }) => {
    try {
      await this.auditService.logModificationApiCall(
        'ATTEMPT',
        'UPDATE',
        'ATTENDEE',
        req.originalUrl,
        req.journeyData,
        res.locals.auditEvent,
      )
      await this.csipApiService.updateAttendee(req as Request, attendeeUuid, changes)
      req.flash(
        FLASH_KEY__CSIP_SUCCESS_MESSAGE,
        req.journeyData.csipRecord!.plan!.reviews.length > 1
          ? MESSAGE_MOST_RECENT_REVIEW_UPDATED
          : MESSAGE_REVIEW_UPDATED,
      )
      await this.auditService.logModificationApiCall(
        'SUCCESS',
        'UPDATE',
        'ATTENDEE',
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
