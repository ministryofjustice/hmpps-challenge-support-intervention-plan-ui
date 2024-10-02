import { NextFunction, Request, Response } from 'express'
import { SchemaType } from './schemas'
import { UpdatePlanController } from '../controller'

export class CaseManagementController extends UpdatePlanController {
  GET = async (req: Request, res: Response) => {
    res.render('update-plan/case-management/view', {
      reasonForPlan: res.locals.formResponses?.['reasonForPlan'] || req.journeyData.plan?.reasonForPlan,
      caseManager: res.locals.formResponses?.['caseManager'] || req.journeyData.plan?.caseManager,
      backUrl: '../update-plan',
    })
  }

  checkSubmitToAPI = async (req: Request<unknown, unknown, SchemaType>, _: Response, next: NextFunction) =>
    this.submitChanges({
      req,
      next,
      changes: {
        reasonForPlan: req.body.reasonForPlan,
        caseManager: req.body.caseManager,
      },
      successMessage: 'You’ve updated the case management information.',
    })

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    res.redirect(`/csip-records/${req.journeyData.csipRecord!.recordUuid}`)
  }
}
