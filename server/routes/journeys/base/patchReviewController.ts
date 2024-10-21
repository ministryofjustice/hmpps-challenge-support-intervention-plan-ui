import { NextFunction, Request } from 'express'
import { format } from 'date-fns'
import { BaseJourneyController } from './controller'
import { components } from '../../../@types/csip'
import { FLASH_KEY__CSIP_SUCCESS_MESSAGE } from '../../../utils/constants'
import { getNonUndefinedProp } from '../../../utils/utils'
import { IdentifiedNeed } from '../../../@types/express'

const MESSAGE_REVIEW_UPDATED = 'You’ve updated the review details.'
const MESSAGE_MOST_RECENT_REVIEW_UPDATED = 'You’ve updated the review details for the most recent review.'

export class PatchReviewController extends BaseJourneyController {
  getSelectedIdentifiedNeed = (req: Request): IdentifiedNeed | undefined => {
    const { identifiedNeedUuid } = req.params
    return req.journeyData.plan!.identifiedNeeds?.find(need => need.identifiedNeedUuid === identifiedNeedUuid)
  }

  submitChanges = async <T>({
    req,
    next,
    changes,
  }: {
    req: Request<unknown, unknown, T>
    next: NextFunction
    changes: Partial<components['schemas']['UpdateReviewRequest']>
  }) => {
    const review = req.journeyData.csipRecord!.plan!.reviews.reduce(
      (prev, cur) => (prev!.reviewSequence > cur.reviewSequence ? prev : cur),
      req.journeyData.csipRecord!.plan!.reviews[0],
    )!

    const payload = {
      recordedBy: review.recordedBy,
      recordedByDisplayName: review.recordedByDisplayName,
      ...getNonUndefinedProp(review, 'reviewDate'),
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
      await this.csipApiService.updateReview(req as Request, payload)
      req.flash(
        FLASH_KEY__CSIP_SUCCESS_MESSAGE,
        req.journeyData.csipRecord!.plan!.reviews.length > 1
          ? MESSAGE_MOST_RECENT_REVIEW_UPDATED
          : MESSAGE_REVIEW_UPDATED,
      )
      next()
    } catch (e) {
      next(e)
    }
  }

  submitAttendeeChanges = async <T>({
    req,
    next,
    attendeeUuid,
    changes,
  }: {
    req: Request<unknown, unknown, T>
    next: NextFunction
    attendeeUuid: string
    changes: Partial<components['schemas']['UpdateAttendeeRequest']>
  }) => {
    const attendee = req.journeyData
      .csipRecord!.plan!.reviews.find(review => review.reviewUuid === req.journeyData.review!.reviewUuid!)!
      .attendees.find(itm => itm.attendeeUuid === attendeeUuid)!

    try {
      await this.csipApiService.updateAttendee(req as Request, attendeeUuid, {
        ...getNonUndefinedProp(attendee, 'name'),
        ...getNonUndefinedProp(attendee, 'role'),
        ...getNonUndefinedProp(attendee, 'isAttended'),
        ...getNonUndefinedProp(attendee, 'contribution'),
        ...changes,
      })
      req.flash(
        FLASH_KEY__CSIP_SUCCESS_MESSAGE,
        req.journeyData.csipRecord!.plan!.reviews.length > 1
          ? MESSAGE_MOST_RECENT_REVIEW_UPDATED
          : MESSAGE_REVIEW_UPDATED,
      )
      next()
    } catch (e) {
      next(e)
    }
  }
}
