import { Request, Response } from 'express'
import { SchemaType } from '../../record-review/outcome/schemas'
import { FLASH_KEY__CSIP_SUCCESS_MESSAGE } from '../../../../utils/constants'
import { MESSAGE_MOST_RECENT_REVIEW_UPDATED, MESSAGE_REVIEW_UPDATED } from '../../base/patchReviewController'

export class UpdateOutcomeController {
  GET = async (req: Request, res: Response) => {
    return res.render('record-review/outcome/view', {
      outcome:
        res.locals.formResponses?.['outcome'] ??
        req.journeyData.review!.outcomeSubJourney?.outcome ??
        req.journeyData.review!.outcome,
      isUpdate: true,
      backUrl: '../update-review',
      recordUuid: req.journeyData.csipRecord!.recordUuid,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.review!.outcomeSubJourney ??= {}
    req.journeyData.review!.outcomeSubJourney.outcome = req.body.outcome

    // The logic assumes the original outcome must be REMAIN_ON_CSIP
    if (req.body.outcome === 'CLOSE_CSIP') {
      return res.redirect('close-csip')
    }

    req.flash(
      FLASH_KEY__CSIP_SUCCESS_MESSAGE,
      req.journeyData.csipRecord!.plan!.reviews.length > 1
        ? MESSAGE_MOST_RECENT_REVIEW_UPDATED
        : MESSAGE_REVIEW_UPDATED,
    )
    return res.redirect(`/csip-records/${req.journeyData.csipRecord!.recordUuid}`)
  }
}
