import { Request, Response } from 'express'

export class ReferralCheckAnswersController {
  GET = async (req: Request, res: Response): Promise<void> => {
    req.journeyData.checkAnswers = true
    res.render('referral/check-answers/view', { referral: req.journeyData.referral })
  }

  POST = async (_req: Request, res: Response): Promise<void> => {
    res.redirect('confirmation')
  }
}
