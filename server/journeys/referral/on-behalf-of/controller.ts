import { Request, Response } from 'express'
import { SchemaType } from './schemas'

export class ReferralOnBehalfOfController {
  GET = async (req: Request, res: Response) => {
    res.render('referral/on-behalf-of/view', {
      isOnBehalfOfReferral: req.journeyData.referral!.onBehalfOfSubJourney
        ? req.journeyData.referral?.onBehalfOfSubJourney?.isOnBehalfOfReferral
        : req.journeyData.referral!.isOnBehalfOfReferral,
      backUrl: req.journeyData.isCheckAnswers ? 'check-answers' : undefined,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.referral!.onBehalfOfSubJourney = { isOnBehalfOfReferral: req.body.isOnBehalfOfReferral }

    if (req.journeyData.referral!.onBehalfOfSubJourney.isOnBehalfOfReferral) {
      res.redirect('referrer')
      return
    }
    res.redirect('area-of-work')
  }
}
