import { Request, Response } from 'express'

export class ConfirmationController {
  GET = async (_req: Request, res: Response): Promise<void> => {
    res.render('referral/confirmation/view', {
      backUrl: false,
    })
  }
}
