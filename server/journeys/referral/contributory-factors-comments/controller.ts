import { Request, Response } from 'express'

export class ReferralContributoryFactorsCommentsController {
  GET = async (req: Request, res: Response) => {
    const { contributoryFactors } = req.journeyData.referral!
    res.render('referral/contributory-factors-comments/view', {
      contributoryFactors,
      backUrl: 'contributory-factors',
    })
  }

  POST = async (_: Request, res: Response) => {
    res.redirect('safer-custody')
  }
}
