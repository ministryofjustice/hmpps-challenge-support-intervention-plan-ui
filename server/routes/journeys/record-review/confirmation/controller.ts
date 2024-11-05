import { Request, Response } from 'express'

export class ConfirmationController {
  GET = async (req: Request, res: Response) => {
    res.render('record-review/confirmation/view', {
      csipRecord: req.journeyData.csipRecord,
      showBreadcrumbs: true,
    })
  }
}
