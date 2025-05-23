import { NextFunction, Request, Response } from 'express'
import { BaseJourneyController } from '../../base/controller'
import { getNonUndefinedProp } from '../../../../utils/utils'
import { FLASH_KEY__CSIP_SUCCESS_MESSAGE } from '../../../../utils/constants'
import { todayString } from '../../../../utils/datetimeUtils'
import CsipApiService from '../../../../services/csipApi/csipApiService'
import AuditService from '../../../../services/auditService'

export class NewIdentifiedNeedCheckAnswersController extends BaseJourneyController {
  constructor(
    override readonly csipApiService: CsipApiService,
    private readonly auditService: AuditService,
  ) {
    super(csipApiService)
  }

  GET = async (req: Request, res: Response) => {
    req.journeyData.isCheckAnswers = true

    res.render('update-plan/check-answers/view', {
      need: req.journeyData.plan!.identifiedNeedSubJourney,
      csipRecordUrl: `/csip-records/${req.journeyData.csipRecord!.recordUuid}`,
      showBreadcrumbs: true,
    })
  }

  checkSubmitToAPI = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const need = req.journeyData.plan!.identifiedNeedSubJourney!
      await this.auditService.logModificationApiCall(
        'ATTEMPT',
        'POST',
        'PLAN',
        `/csip-records/${req.journeyData.csipRecord!.recordUuid}/plan/identified-needs`,
        req.journeyData,
        res.locals.auditEvent,
      )
      await this.csipApiService.addIdentifiedNeed(req, {
        identifiedNeed: need.identifiedNeed!,
        intervention: need.intervention!,
        responsiblePerson: need.responsiblePerson!,
        targetDate: need.targetDate!,
        createdDate: todayString(),
        ...getNonUndefinedProp(need, 'progression'),
      })
      req.journeyData.journeyCompleted = true
      req.flash(FLASH_KEY__CSIP_SUCCESS_MESSAGE, `You’ve added another identified need to this plan.`)
      await this.auditService.logModificationApiCall(
        'SUCCESS',
        'POST',
        'PLAN',
        `/csip-records/${req.journeyData.csipRecord!.recordUuid}/plan/identified-needs`,
        req.journeyData,
        res.locals.auditEvent,
      )
      next()
    } catch (e) {
      next(e)
    }
  }

  POST = this.deleteJourneyDataAndGoBackToCsipRecordPage
}
