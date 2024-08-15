import { Request, Response } from 'express'
import { SchemaType } from './schemas'

export class ReferralProactiveOrReactiveController {
  GET = async (req: Request, res: Response) => {
    const backUrl = req.journeyData.referral!.isOnBehalfOfReferral! ? 'referrer' : 'area-of-work'
    const { isProactiveReferral } = req.journeyData.referral!
    res.render('referral/proactive-or-reactive/view', { isProactiveReferral, backUrl })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.referral!.isProactiveReferral = req.body.isProactiveReferral
    res.redirect('details')
  }
}
