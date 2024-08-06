import { Request, Response } from 'express'

export class ConfirmationController {
  GET = async (_req: Request, res: Response) => {
    res.render('referral/confirmation/view', {
      showBreadcrumbs: true,
    })
  }
}
