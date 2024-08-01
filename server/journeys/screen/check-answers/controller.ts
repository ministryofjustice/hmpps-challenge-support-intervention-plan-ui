import { Request, RequestHandler, Response } from 'express'
import { BaseJourneyController } from '../../base/controller'
import { SanitisedError } from '../../../sanitisedError'

export class ScreenCheckAnswersController extends BaseJourneyController {
  GET = async (req: Request, res: Response): Promise<void> => {
    req.journeyData.isCheckAnswers = true

    res.render('screen/check-answers/view', {
      saferCustodyScreening: req.journeyData.saferCustodyScreening,
    })
  }

  checkSubmitToAPI: RequestHandler = async (req, res, next) => {
    const screening = req.journeyData.saferCustodyScreening!
    try {
      await this.createScreeningOutcome(req, {
        outcomeTypeCode: screening.outcomeType!.code,
        date: new Date().toISOString().substring(0, 10),
        reasonForDecision: screening.reasonForDecision!,
        ...this.getRecordedByFieldsFromJwt(res.locals.user.token),
      })
      req.journeyData.journeyCompleted = true
    } catch (e) {
      if ((e as SanitisedError)['data']) {
        const errorRespData = (e as SanitisedError)['data'] as Record<string, string | unknown>
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

  POST = async (_req: Request, res: Response): Promise<void> => {
    res.redirect('confirmation')
  }
}
