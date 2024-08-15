import { Request, Response } from 'express'

export class RecordInvestigationController {
  GET = async (req: Request, res: Response) => {
    res.render('record-investigation/view', {
      logCode: req.journeyData.csipRecord!.logCode,
      investigation: req.journeyData.investigation,
    })
  }
}
