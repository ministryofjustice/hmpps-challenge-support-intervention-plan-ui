import { Request, Response } from 'express'

export class ReferralRootController {
  GET = async (_req: Request, res: Response): Promise<void> => {
    res.render('referral/view')
  }
}
