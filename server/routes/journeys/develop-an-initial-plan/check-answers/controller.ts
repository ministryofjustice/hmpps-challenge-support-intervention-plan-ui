import { NextFunction, Request, Response } from 'express'
import { BaseJourneyController } from '../../base/controller'
import { SanitisedError } from '../../../../sanitisedError'

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

  checkSubmitToAPI = async (req: Request, res: Response, next: NextFunction) => {
    const plan = req.journeyData.plan!
    try {
      await this.csipApiService.createPlan(req, {
        caseManager: plan.caseManager!,
        firstCaseReviewDate: plan.firstCaseReviewDate!,
        reasonForPlan: plan.reasonForPlan!,
        identifiedNeeds: plan.identifiedNeeds!.map(({ progression, closedDate, ...identifiedNeed }) => ({
          ...identifiedNeed,
          ...(progression ? { progression } : {}),
        })),
      })
      req.journeyData.journeyCompleted = true
    } catch (e) {
      if ((e as SanitisedError).data) {
        const errorRespData = (e as SanitisedError).data as Record<string, string | unknown>
        req.flash(
          'validationErrors',
          JSON.stringify({
            plan: [errorRespData?.['userMessage'] as string],
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
