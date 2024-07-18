import { Request, Response } from 'express'
import { BaseJourneyController } from '../../base/controller'

export class ReferralReferrerController extends BaseJourneyController {
  GET = async (req: Request, res: Response): Promise<void> => {
    const areaOfWorkOptions = await this.getReferenceDataOptionsForSelect(
      req,
      'area-of-work',
      'Select area',
      res.locals.formResponses?.['areaOfWork'] || req.journeyData.referral!.refererArea,
    )
    const { referredBy } = req.journeyData.referral!
    const backUrl =
      req.journeyData.isCheckAnswers && !req.journeyData.referral!.onBehalfOfSubJourney
        ? 'check-answers'
        : 'on-behalf-of'

    res.render('referral/referrer/view', { areaOfWorkOptions, referredBy, backUrl })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    if (req.journeyData.referral!.onBehalfOfSubJourney) {
      req.journeyData.referral!.isOnBehalfOfReferral =
        req.journeyData.referral!.onBehalfOfSubJourney.isOnBehalfOfReferral!
      delete req.journeyData.referral!.onBehalfOfSubJourney
    }

    req.journeyData.referral!.refererArea = req.body['areaOfWork']
    req.journeyData.referral!.referredBy = req.body['referredBy']
    res.redirect(req.journeyData.isCheckAnswers ? 'check-answers' : 'proactive-or-reactive')
  }
}
