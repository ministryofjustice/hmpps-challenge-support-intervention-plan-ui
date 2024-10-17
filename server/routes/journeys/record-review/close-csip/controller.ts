import { Request, Response } from 'express'

export class CloseCsipController {
  GET = async (req: Request, res: Response) => {
    res.render('record-review/close-csip/view', {
      openIdentifiedNeeds: (req.journeyData.csipRecord?.plan?.identifiedNeeds || []).filter(o => !o.closedDate).length,
      backUrl: 'outcome',
    })
  }

  POST = async (_req: Request<unknown, unknown, unknown>, res: Response) => {
    res.redirect('check-answers')
  }
}
