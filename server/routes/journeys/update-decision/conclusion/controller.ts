import { NextFunction, Request, Response } from 'express'
import { SchemaType } from './schemas'
import { PatchDecisionController } from '../../base/patchDecisionController'
import { getMaxCharsAndThresholdForAppend, getTextForApiSubmission } from '../../../../utils/appendFieldUtils'

export class UpdateConclusionController extends PatchDecisionController {
  GET = async (req: Request, res: Response) => {
    const currentConclusion = req.journeyData.csipRecord!.referral.decisionAndActions!.conclusion
    res.render('update-decision/conclusion/view', {
      currentConclusion,
      conclusion: res.locals.formResponses?.['conclusion'],
      isUpdate: true,
      recordUuid: req.journeyData.csipRecord!.recordUuid,
      ...getMaxCharsAndThresholdForAppend(res.locals.user.displayName, currentConclusion),
      backUrl: '../update-decision',
    })
  }

  checkSubmitToAPI = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) =>
    this.submitChanges({
      req,
      res,
      next,
      changes: {
        conclusion: getTextForApiSubmission(
          req.journeyData.decisionAndActions!.conclusion,
          res.locals.user.displayName,
          req.body.conclusion,
        ),
      },
    })

  POST = this.deleteJourneyDataAndGoBackToCsipRecordPage
}
