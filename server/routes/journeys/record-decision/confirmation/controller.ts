import { Request, Response } from 'express'

export class ConfirmationController {
  GET = async (req: Request, res: Response) => {
    const { csipRecord } = req.journeyData
    res.render('record-decision/confirmation/view', {
      showBreadcrumbs: true,
      csipRecord,
    })
  }
}
