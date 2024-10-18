import { Request, Response } from 'express'

export class ConfirmationController {
  GET = async (req: Request, res: Response) => {
    res.render('record-review/confirmation/view', {
      recordUuid: req.journeyData.csipRecord!.recordUuid,
      planClosed: req.journeyData.review?.outcome === 'CLOSE_CSIP',
      showBreadcrumbs: true,
    })
  }
}
