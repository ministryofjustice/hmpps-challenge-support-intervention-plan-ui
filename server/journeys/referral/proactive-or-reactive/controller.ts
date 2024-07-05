import { Request, Response } from 'express'

export class ReferralProactiveOrReactiveController {
  GET = async (req: Request, res: Response): Promise<void> => {
    const backUrl = req.journeyData.referral!.isOnBehalfOfReferral！ ? 'referrer' : 'area-of-work'
    const { isProactiveReferral } = req.journeyData.referral!
    res.render('referral/proactive-or-reactive/view', { isProactiveReferral, backUrl })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    req.journeyData.referral!.isProactiveReferral = req.body['isProactiveReferral']
    res.redirect('details')
  }
}
