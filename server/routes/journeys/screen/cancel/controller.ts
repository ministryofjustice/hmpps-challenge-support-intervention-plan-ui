import { Request, Response } from 'express'

export class CancelController {
  GET = async (req: Request, res: Response) => {
    res.render('pages/cancel', {
      showBreadcrumbs: true,
      csipRecordUrl: `/csip-records/${req.journeyData.csipRecord!.recordUuid}`,
    })
  }
}
