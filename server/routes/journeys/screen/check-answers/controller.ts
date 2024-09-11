import { NextFunction, Request, Response } from 'express'
import { BaseJourneyController } from '../../base/controller'
import { SanitisedError } from '../../../../sanitisedError'
import { todayString } from '../../../../utils/datetimeUtils'
import { FLASH_KEY__VALIDATION_ERRORS } from '../../../../utils/constants'

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
    } catch (e) {
      if ((e as SanitisedError).data) {
        const errorRespData = (e as SanitisedError).data as Record<string, string | unknown>
        req.flash(
          FLASH_KEY__VALIDATION_ERRORS,
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
