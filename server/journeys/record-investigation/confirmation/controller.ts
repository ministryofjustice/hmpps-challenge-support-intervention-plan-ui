import { Request, Response } from 'express'

export class ConfirmationController {
  GET = async (_req: Request, res: Response) => {
    res.render('record-investigation/confirmation/view', {
      showBreadcrumbs: true,
    })
  }
}
