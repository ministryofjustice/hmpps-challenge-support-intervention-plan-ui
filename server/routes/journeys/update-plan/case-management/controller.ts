import { NextFunction, Request, Response } from 'express'
import { SchemaType } from './schemas'
import { PatchPlanController } from '../../base/patchPlanController'

export class CaseManagementController extends PatchPlanController {
  GET = async (req: Request, res: Response) => {
    res.render('update-plan/case-management/view', {
      reasonForPlan: res.locals.formResponses?.['reasonForPlan'] ?? req.journeyData.plan?.reasonForPlan,
      caseManager: res.locals.formResponses?.['caseManager'] ?? req.journeyData.plan?.caseManager,
      recordUuid: req.journeyData.csipRecord!.recordUuid,
      backUrl: '../update-plan',
    })
  }

  checkSubmitToAPI = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) =>
    this.submitChanges({
      req,
      res,
      next,
      changes: {
        reasonForPlan: req.body.reasonForPlan,
        caseManager: req.body.caseManager,
      },
    })

  POST = this.deleteJourneyDataAndGoBackToCsipRecordPage
}
