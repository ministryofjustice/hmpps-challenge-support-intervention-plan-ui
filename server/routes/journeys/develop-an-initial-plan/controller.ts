import { Request, Response } from 'express'
import { SchemaType } from './schemas'

export class DevelopPlanController {
  GET = async (req: Request, res: Response) => {
    // Differentiate between not set, false and true
    const formResponseIsCaseManager =
      res.locals.formResponses?.['isCaseManager'] === undefined
        ? undefined
        : res.locals.formResponses?.['isCaseManager'] === 'true'

    const isCaseManager = formResponseIsCaseManager ?? req.journeyData.plan!.isCaseManager
    const caseManager = res.locals.formResponses?.['caseManager'] ?? req.journeyData.plan!.caseManager
    const reasonForPlan = res.locals.formResponses?.['reasonForPlan'] ?? req.journeyData.plan!.reasonForPlan

    res.render('develop-an-initial-plan/view', {
      isCaseManager,
      caseManager,
      reasonForPlan,
      backUrl: `/csip-records/${req.journeyData.csipRecord!.recordUuid}`,
      backUrlText: 'Back to CSIP record',
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.plan!.isCaseManager = req.body.isCaseManager
    if (!req.body.isCaseManager && req.body.caseManager) {
      req.journeyData.plan!.caseManager = req.body.caseManager
    } else {
      req.journeyData.plan!.caseManager = res.locals.user.displayName.substring(0, 100)
    }
    req.journeyData.plan!.reasonForPlan = req.body.reasonForPlan
    res.redirect('develop-an-initial-plan/identified-needs')
  }
}
