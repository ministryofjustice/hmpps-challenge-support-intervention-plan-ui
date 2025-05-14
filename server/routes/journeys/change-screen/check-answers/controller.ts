import { NextFunction, Request, Response } from 'express'
import { BaseJourneyController } from '../../base/controller'
import { todayString } from '../../../../utils/datetimeUtils'
import AuditService from '../../../../services/auditService'
import CsipApiService from '../../../../services/csipApi/csipApiService'
import { FLASH_KEY__CSIP_SUCCESS_MESSAGE } from '../../../../utils/constants'

export class ChangeScreenCheckAnswersController extends BaseJourneyController {
  constructor(
    override readonly csipApiService: CsipApiService,
    private readonly auditService: AuditService,
  ) {
    super(csipApiService)
  }

  GET = async (req: Request, res: Response) => {
    req.journeyData.isCheckAnswers = true

    res.render('screen/check-answers/view', {
      changeScreen: true,
      backUrl: `../change-screen`,
      saferCustodyScreening: req.journeyData.saferCustodyScreening,
      csipRecordUrl: `/csip-records/${req.journeyData.csipRecord!.recordUuid}`,
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

  POST = async (req: Request, res: Response) => {
    req.flash(FLASH_KEY__CSIP_SUCCESS_MESSAGE, `You’ve changed the screening outcome.`)
    this.deleteJourneyDataAndGoBackToCsipRecordPage(req, res)
  }
}
