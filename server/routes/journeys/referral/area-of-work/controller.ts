import { Request, Response } from 'express'
import { BaseJourneyController } from '../../base/controller'
import { SchemaType } from './schemas'

export class ReferralAreaOfWorkController extends BaseJourneyController {
  GET = async (req: Request, res: Response) => {
    const areaOfWorkOptions = await this.getReferenceDataOptionsForSelect(
      req,
      'area-of-work',
      'Select area',
      res.locals.formResponses?.['refererArea'] ?? req.journeyData.referral!.refererArea,
    )
    const backUrl =
      req.journeyData.isCheckAnswers && !req.journeyData.referral!.onBehalfOfSubJourney
        ? 'check-answers'
        : 'on-behalf-of'

    res.render('referral/area-of-work/view', { areaOfWorkOptions, backUrl })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    if (req.journeyData.referral!.onBehalfOfSubJourney) {
      req.journeyData.referral!.isOnBehalfOfReferral =
        req.journeyData.referral!.onBehalfOfSubJourney.isOnBehalfOfReferral!
      delete req.journeyData.referral!.onBehalfOfSubJourney
    }

    req.journeyData.referral!.refererArea = req.body.areaOfWork
    req.journeyData.referral!.referredBy = res.locals.user.displayName.substring(0, 240)
    res.redirect(req.journeyData.isCheckAnswers ? 'check-answers' : 'proactive-or-reactive')
  }
}
