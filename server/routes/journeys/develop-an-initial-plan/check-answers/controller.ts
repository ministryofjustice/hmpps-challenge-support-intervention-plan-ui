import { NextFunction, Request, Response } from 'express'
import { BaseJourneyController } from '../../base/controller'
import { SanitisedError } from '../../../../sanitisedError'
import { todayString } from '../../../../utils/datetimeUtils'
import { SchemaType } from '../schemas'

export class CheckAnswersController extends BaseJourneyController {
  GET = async (req: Request, res: Response) => {
    res.render('develop-an-initial-plan/check-answers/view', {
      backUrl: 'check-answers',
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    res.redirect('check-answers')
  }

  checkSubmitToAPI = async (req: Request, res: Response, next: NextFunction) => {
    const plan = req.journeyData.plan!
    try {
      await this.csipApiService.createInitialPlan(req, {
        caseManager: plan.caseManager!,
        firstCaseReviewDate: plan.firstCaseReviewDate!,
        reasonForPlan: plan.reasonForPlan!,
        identifiedNeeds: plan.identifiedNeeds!.map(identifiedNeed => ({
          identifiedNeed: identifiedNeed.identifiedNeed!,
          responsiblePerson: identifiedNeed.responsiblePerson!,
          intervention: identifiedNeed.intervention!,
          createdDate: todayString(),
          targetDate: identifiedNeed.targetDate!,
          ...(identifiedNeed.progression ? { progression: identifiedNeed.progression! } : {}),
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
}
