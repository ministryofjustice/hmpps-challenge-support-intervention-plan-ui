import { NextFunction, Request, Response } from 'express'
import { BaseJourneyController } from '../../base/controller'
import { todayString } from '../../../../utils/datetimeUtils'

export class ScreenCheckAnswersController extends BaseJourneyController {
  GET = async (req: Request, res: Response) => {
    req.journeyData.isCheckAnswers = true

    res.render('screen/check-answers/view', {
      saferCustodyScreening: req.journeyData.saferCustodyScreening,
      csipRecordUrl: `/csip-records/${req.journeyData.csipRecord!.recordUuid}`,
    })
  }

  checkSubmitToAPI = async (req: Request, res: Response, next: NextFunction) => {
    const screening = req.journeyData.saferCustodyScreening!
    try {
      await this.csipApiService.createScreeningOutcome(req, {
        outcomeTypeCode: screening.outcomeType!.code,
        date: todayString(),
        reasonForDecision: screening.reasonForDecision!,
        recordedBy: res.locals.user.username,
        recordedByDisplayName: res.locals.user.displayName,
      })
      req.journeyData.csipRecord = await this.csipApiService.getCsipRecord(req, req.journeyData.csipRecord!.recordUuid)
      req.journeyData.journeyCompleted = true
      next()
    } catch (e) {
      next(e)
    }
  }

  POST = async (_req: Request, res: Response) => {
    res.redirect('confirmation')
  }
}
