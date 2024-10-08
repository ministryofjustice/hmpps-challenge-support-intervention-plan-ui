import { NextFunction, Request, Response } from 'express'
import { BaseJourneyController } from '../../base/controller'

export class PlanCheckAnswersController extends BaseJourneyController {
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
    })
  }

  checkSubmitToAPI = async (req: Request, _res: Response, next: NextFunction) => {
    const plan = req.journeyData.plan!
    try {
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
      next()
    } catch (e) {
      next(e)
    }
  }

  POST = async (_req: Request, res: Response) => {
    res.redirect('confirmation')
  }
}
