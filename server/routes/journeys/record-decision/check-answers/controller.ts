import { NextFunction, Request, Response } from 'express'
import { BaseJourneyController } from '../../base/controller'
import { todayString } from '../../../../utils/datetimeUtils'

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
      next()
    } catch (e) {
      next(e)
    }
  }

  POST = async (_req: Request, res: Response) => {
    res.redirect('confirmation')
  }
}
