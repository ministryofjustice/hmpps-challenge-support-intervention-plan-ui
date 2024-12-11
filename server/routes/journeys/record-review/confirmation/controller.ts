import { Request, Response } from 'express'

export class ConfirmationController {
  GET = async (req: Request, res: Response) => {
    const { csipRecord } = req.journeyData
    // @ts-expect-error delete non-optional req.journeyData to free up redis memory
    delete req.journeyData
    res.render('record-review/confirmation/view', {
      csipRecord,
      showBreadcrumbs: true,
    })
  }
}
