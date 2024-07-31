import { Request, RequestHandler, Response } from 'express'
import { BaseJourneyController } from '../../base/controller'

export class ScreenCheckAnswersController extends BaseJourneyController {
  GET = async (req: Request, res: Response): Promise<void> => {
    req.journeyData.isCheckAnswers = true

    res.render('screen/check-answers/view', {
      saferCustodyScreening: req.journeyData.saferCustodyScreening,
    })
  }

  checkSubmitToAPI: RequestHandler = async (_req, _res, next) => {
    // Not implemented yet
    next()
  }

  POST = async (_req: Request, res: Response): Promise<void> => {
    res.redirect('confirmation')
  }
}
