import { Request, Response } from 'express'
import type PrisonerSearchService from '../../../services/prisonerSearch/prisonerSearchService'
import { BaseJourneyController } from '../base/controller'
import CsipApiService from '../../../services/csipApi/csipApiService'
import { getNonUndefinedProp, summarisePrisoner } from '../../../utils/utils'
import { attendeeSorter } from '../../../utils/sorters'
import { isCsipProcessor } from '../../../authentication/authorisedRoles'

export class UpdateReviewController extends BaseJourneyController {
  constructor(
    override readonly csipApiService: CsipApiService,
    private readonly prisonerSearchService: PrisonerSearchService,
  ) {
    super(csipApiService)
  }

  UPDATE = async (req: Request, res: Response) => {
    const record = req.journeyData.csipRecord!
    if (!record.plan?.reviews?.length || record.status.code !== 'CSIP_OPEN') {
      return res.redirect(`/csip-records/${record.recordUuid}`)
    }

    req.journeyData.prisoner = summarisePrisoner(
      await this.prisonerSearchService.getPrisonerDetails(req, record.prisonNumber),
    )
    const review = record.plan.reviews.reduce(
      (prev, cur) => (prev!.reviewSequence > cur.reviewSequence ? prev : cur),
      record.plan.reviews[0],
    )!

    req.journeyData.review = {
      reviewUuid: review.reviewUuid,
      reviewDate: review.reviewDate,
      ...getNonUndefinedProp(review, 'nextReviewDate'),
      ...getNonUndefinedProp(review, 'summary'),
      outcome: review.csipClosedDate ? 'CLOSE_CSIP' : 'REMAIN_ON_CSIP',
      attendees: review.attendees,
    }
    req.journeyData.isUpdate = true

    const secondaryButton = {
      label: 'Cancel',
      link: `/csip-records/${record.recordUuid}`,
    }

    return res.render('update-review/view', {
      status: record.status.code,
      reviewCount: record.plan.reviews.length,
      review,
      attendees: review.attendees.sort(attendeeSorter),
      recordUuid: record.recordUuid,
      showBreadcrumbs: true,
      secondaryButton,
      isCsipProcessor: isCsipProcessor(res),
    })
  }
}
