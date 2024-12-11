import { Request, Response } from 'express'

export class ConfirmationController {
  GET = async (req: Request, res: Response) => {
    // @ts-expect-error delete non-optional req.journeyData to free up redis memory
    delete req.journeyData
    res.render('referral/confirmation/view', {
      showBreadcrumbs: true,
    })
  }
}
