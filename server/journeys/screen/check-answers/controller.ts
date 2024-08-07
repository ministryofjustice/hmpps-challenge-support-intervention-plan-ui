import { NextFunction, Request, Response } from 'express'
import { BaseJourneyController } from '../../base/controller'
import { SanitisedError } from '../../../sanitisedError'
import { todayString } from '../../../utils/datetimeUtils'

export class ScreenCheckAnswersController extends BaseJourneyController {
  GET = async (req: Request, res: Response) => {
    req.journeyData.isCheckAnswers = true

    res.render('screen/check-answers/view', {
      saferCustodyScreening: req.journeyData.saferCustodyScreening,
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
      req.journeyData.journeyCompleted = true
    } catch (e) {
      if ((e as SanitisedError).data) {
        const errorRespData = (e as SanitisedError).data as Record<string, string | unknown>
        req.flash(
          'validationErrors',
          JSON.stringify({
            saferCustodyScreening: [errorRespData?.['userMessage'] as string],
          }),
        )
      }
      res.redirect('back')
      return
    }
    next()
  }

  POST = async (_req: Request, res: Response) => {
    res.redirect('confirmation')
  }
}
