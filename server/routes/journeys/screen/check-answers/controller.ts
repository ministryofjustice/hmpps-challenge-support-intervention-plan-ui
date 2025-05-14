import { NextFunction, Request, Response } from 'express'
import { BaseJourneyController } from '../../base/controller'
import { todayString } from '../../../../utils/datetimeUtils'
import AuditService from '../../../../services/auditService'
import CsipApiService from '../../../../services/csipApi/csipApiService'

export class ScreenCheckAnswersController extends BaseJourneyController {
  constructor(
    override readonly csipApiService: CsipApiService,
    private readonly auditService: AuditService,
  ) {
    super(csipApiService)
  }

  GET = async (req: Request, res: Response) => {
    req.journeyData.isCheckAnswers = true

    res.render('screen/check-answers/view', {
      saferCustodyScreening: req.journeyData.saferCustodyScreening,
      csipRecordUrl: `/csip-records/${req.journeyData.csipRecord!.recordUuid}`,
      showBreadcrumbs: true,
    })
  }

  checkSubmitToAPI = async (req: Request, res: Response, next: NextFunction) => {
    const screening = req.journeyData.saferCustodyScreening!
    try {
      await this.auditService.logModificationApiCall(
        'ATTEMPT',
        'PUT',
        'SAFER_CUSTODY_SCREENING_OUTCOME',
        `/csip-records/${req.journeyData.csipRecord!.recordUuid}/referral/safer-custody-screening`,
        req.journeyData,
        res.locals.auditEvent,
      )
      await this.csipApiService.upsertScreeningOutcome(req, {
        outcomeTypeCode: screening.outcomeType!.code,
        date: todayString(),
        reasonForDecision: screening.reasonForDecision!,
        recordedBy: res.locals.user.username,
        recordedByDisplayName: res.locals.user.displayName,
      })
      req.journeyData.csipRecord = await this.csipApiService.getCsipRecord(req, req.journeyData.csipRecord!.recordUuid)
      req.journeyData.journeyCompleted = true
      await this.auditService.logModificationApiCall(
        'SUCCESS',
        'PUT',
        'SAFER_CUSTODY_SCREENING_OUTCOME',
        `/csip-records/${req.journeyData.csipRecord!.recordUuid}/referral/safer-custody-screening`,
        req.journeyData,
        res.locals.auditEvent,
      )
      next()
    } catch (e) {
      next(e)
    }
  }

  POST = async (_req: Request, res: Response) => {
    res.redirect('confirmation')
  }
}
