import { NextFunction, Request, Response } from 'express'
import { BaseJourneyController } from '../../base/controller'
import { todayString } from '../../../../utils/datetimeUtils'
import CsipApiService from '../../../../services/csipApi/csipApiService'
import AuditService from '../../../../services/auditService'
import { FLASH_KEY__CSIP_SUCCESS_MESSAGE } from '../../../../utils/constants'

export class CheckAnswersController extends BaseJourneyController {
  constructor(
    override readonly csipApiService: CsipApiService,
    private readonly auditService: AuditService,
  ) {
    super(csipApiService)
  }

  GET = async (req: Request, res: Response) => {
    req.journeyData.isCheckAnswers = true

    const { decisionAndActions } = req.journeyData
    res.render('record-decision/check-answers/view', {
      decisionAndActions,
      backUrl: `../change-decision/additional-information`,
      backUrlText: 'Back to additional information',
      csipRecordUrl: `/csip-records/${req.journeyData.csipRecord!.recordUuid}`,
      changeDecision: true,
    })
  }

  checkSubmitToAPI = async (req: Request, res: Response, next: NextFunction) => {
    const decision = req.journeyData.decisionAndActions!
    try {
      await this.auditService.logModificationApiCall(
        'ATTEMPT',
        'CREATE',
        'DECISION_AND_ACTIONS',
        req.originalUrl,
        req.journeyData,
        res.locals.auditEvent,
      )
      await this.csipApiService.upsertDecision(req, {
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
      await this.auditService.logModificationApiCall(
        'SUCCESS',
        'CREATE',
        'DECISION_AND_ACTIONS',
        req.originalUrl,
        req.journeyData,
        res.locals.auditEvent,
      )
      next()
    } catch (e) {
      next(e)
    }
  }

  POST = async (req: Request, res: Response) => {
    req.flash(FLASH_KEY__CSIP_SUCCESS_MESSAGE, `You’ve changed the CSIP investigation decision.`)
    res.redirect(`/csip-records/${req.journeyData.csipRecord!.recordUuid}`)
  }
}
