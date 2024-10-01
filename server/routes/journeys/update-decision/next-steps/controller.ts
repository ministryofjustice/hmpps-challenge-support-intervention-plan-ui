import { NextFunction, Request, Response } from 'express'
import { SchemaType } from '../../record-decision/next-steps/schemas'
import { generateSaveTimestamp, getMaxCharsAndThresholdForAppend } from '../../../../utils/appendFieldUtils'
import { PatchDecisionController } from '../../base/patchDecisionController'

export class UpdateNextStepsController extends PatchDecisionController {
  GET = async (req: Request, res: Response) => {
    req.journeyData.isUpdate = true
    const currentNextSteps = req.journeyData.csipRecord!.referral.decisionAndActions!.nextSteps
    res.render('record-decision/next-steps/view', {
      currentNextSteps,
      nextSteps: res.locals.formResponses?.['nextSteps'],
      isUpdate: true,
      backUrl: '../update-decision',
      recordUuid: req.journeyData.csipRecord!.recordUuid,
      ...getMaxCharsAndThresholdForAppend(res.locals.user.displayName, currentNextSteps),
    })
  }

  checkSubmitToAPI = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) =>
    this.submitChanges({
      req,
      next,
      changes: {
        nextSteps:
          (req.journeyData.decisionAndActions!.nextSteps ?? '') +
          generateSaveTimestamp(res.locals.user.displayName) +
          req.body.nextSteps,
      },
    })

  POST = async (req: Request, res: Response) => {
    res.redirect(`/csip-records/${req.journeyData.csipRecord!.recordUuid}`)
  }
}
