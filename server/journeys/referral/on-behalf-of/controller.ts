import { Request, Response } from 'express'

export class ReferralOnBehalfOfController {
  GET = async (_req: Request, res: Response): Promise<void> => {
    res.render('referral/on-behalf-of/view')
  }

  POST = async (_req: Request, res: Response): Promise<void> => {
    res.redirect('/referral/on-behalf-of')
  }
}
