import { Request, Response } from 'express'
import { BaseJourneyController } from '../../base/controller'

export class DecisionCheckAnswersController extends BaseJourneyController {
  GET = async (req: Request, res: Response) => {
    req.journeyData.isCheckAnswers = true

    const { decisionAndActions } = req.journeyData
    res.render('record-decision/check-answers/view', {
      decisionAndActions,
      csipRecordUrl: `/csip-records/${req.journeyData.csipRecord!.recordUuid}`,
    })
  }

  POST = async (_req: Request, res: Response) => {
    res.redirect('confirmation')
  }
}
