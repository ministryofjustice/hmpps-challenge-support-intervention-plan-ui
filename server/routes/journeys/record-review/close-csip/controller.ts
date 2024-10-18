import { Request, Response } from 'express'

export class CloseCsipController {
  GET = async (req: Request, res: Response) => {
    const needs = (req.journeyData.csipRecord?.plan?.identifiedNeeds || []).filter(o => !o.closedDate).length
    res.render('record-review/close-csip/view', {
      showWarning: needs > 0,
      needsPrepend: needs === 1 ? 'There is 1 open identified need' : `There are ${needs} open identified needs`,
      backUrl: 'outcome',
    })
  }

  POST = async (_req: Request<unknown, unknown, unknown>, res: Response) => {
    res.redirect('check-answers')
  }
}
