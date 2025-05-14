import { NextFunction, Request, Response } from 'express'
import { BaseJourneyController } from '../../base/controller'
import CsipApiService from '../../../../services/csipApi/csipApiService'
import AuditService from '../../../../services/auditService'

export class PlanCheckAnswersController extends BaseJourneyController {
  constructor(
    override readonly csipApiService: CsipApiService,
    private readonly auditService: AuditService,
  ) {
    super(csipApiService)
  }

  GET = async (req: Request, res: Response) => {
    req.journeyData.isCheckAnswers = true

    const { plan } = req.journeyData
    const sortedNeeds = plan!.identifiedNeeds?.sort((needA, needB) => {
      return new Date(needA.createdDate).getTime() - new Date(needB.createdDate).getTime()
    })
    res.render('develop-an-initial-plan/check-answers/view', {
      plan: {
        ...plan,
        identifiedNeeds: sortedNeeds,
      },
      csipRecordUrl: `/csip-records/${req.journeyData.csipRecord!.recordUuid}`,
      showBreadcrumbs: true,
    })
  }

  checkSubmitToAPI = async (req: Request, res: Response, next: NextFunction) => {
    const plan = req.journeyData.plan!
    try {
      await this.auditService.logModificationApiCall(
        'ATTEMPT',
        'POST',
        'PLAN',
        `/csip-records/${req.journeyData.csipRecord!.recordUuid}/plan`,
        req.journeyData,
        res.locals.auditEvent,
      )
      await this.csipApiService.createPlan(req, {
        caseManager: plan.caseManager!,
        nextCaseReviewDate: plan.nextCaseReviewDate!,
        reasonForPlan: plan.reasonForPlan!,
        identifiedNeeds: plan.identifiedNeeds!.map(({ progression, closedDate, ...identifiedNeed }) => ({
          ...identifiedNeed,
          ...(progression ? { progression } : {}),
        })),
      })
      req.journeyData.journeyCompleted = true
      await this.auditService.logModificationApiCall(
        'SUCCESS',
        'POST',
        'PLAN',
        `/csip-records/${req.journeyData.csipRecord!.recordUuid}/plan`,
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
