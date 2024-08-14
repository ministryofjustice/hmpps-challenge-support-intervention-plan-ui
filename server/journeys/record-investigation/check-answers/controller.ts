import { Request, Response } from 'express'

export class InvestigationCheckAnswersController {
  GET = async (req: Request, res: Response) => {
    req.journeyData.isCheckAnswers = true

    const { investigation } = req.journeyData
    res.render('record-investigation/check-answers/view', {
      investigation,
      csipRecordUrl: `/csip-records/${req.journeyData.csipRecord!.recordUuid}`,
    })
  }

  POST = async (_req: Request, res: Response) => {
    res.redirect('confirmation')
  }
}
