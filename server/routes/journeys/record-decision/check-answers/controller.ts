import { NextFunction, Request, Response } from 'express'
import { BaseJourneyController } from '../../base/controller'
import { SanitisedError } from '../../../../sanitisedError'
import { todayString } from '../../../../utils/datetimeUtils'
import { FLASH_KEY__VALIDATION_ERRORS } from '../../../../utils/constants'

export class DecisionCheckAnswersController extends BaseJourneyController {
  GET = async (req: Request, res: Response) => {
    req.journeyData.isCheckAnswers = true

    const { decisionAndActions } = req.journeyData
    res.render('record-decision/check-answers/view', {
      decisionAndActions,
      csipRecordUrl: `/csip-records/${req.journeyData.csipRecord!.recordUuid}`,
    })
  }

  checkSubmitToAPI = async (req: Request, res: Response, next: NextFunction) => {
    const decision = req.journeyData.decisionAndActions!
    try {
      await this.csipApiService.createDecision(req, {
        date: todayString(),
        recordedBy: res.locals.user.username,
        recordedByDisplayName: res.locals.user.displayName,
        conclusion: decision.conclusion!,
        outcomeTypeCode: decision.outcome!.code,
        signedOffByRoleCode: decision.signedOffByRole!.code,
        actions: [],
        ...(decision.actionOther && { actionOther: decision.actionOther }),
        ...(decision.nextSteps && { nextSteps: decision.nextSteps }),
      })
      req.journeyData.csipRecord = await this.csipApiService.getCsipRecord(req, req.journeyData.csipRecord!.recordUuid)
      req.journeyData.journeyCompleted = true
    } catch (e) {
      if ((e as SanitisedError).data) {
        const errorRespData = (e as SanitisedError).data as Record<string, string | unknown>
        req.flash(
          FLASH_KEY__VALIDATION_ERRORS,
          JSON.stringify({
            decisionAndActions: [errorRespData?.['userMessage'] as string],
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
