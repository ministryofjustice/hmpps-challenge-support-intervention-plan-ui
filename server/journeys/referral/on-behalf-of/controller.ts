import { Request, Response } from 'express'
import { SchemaType } from './schemas'

export class ReferralOnBehalfOfController {
  GET = async (_req: Request, res: Response): Promise<void> => {
    res.render('referral/on-behalf-of/view', {
      backUrl: true,
    })
  }

  POST = async (req: Request<unknown, SchemaType>, res: Response): Promise<void> => {
    if (!req.journeyData.referral) {
      req.journeyData.referral = {}
    }
    req.journeyData.referral.isOnBehalfOfReferral = req.body.isOnBehalfOfReferral

    if (req.journeyData.referral.isOnBehalfOfReferral) {
      res.redirect('/referral/referrer')
      return
    }
    res.redirect('/referral/area-of-work')
  }
}
