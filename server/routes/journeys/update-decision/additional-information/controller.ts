import { NextFunction, Request, Response } from 'express'
import { SchemaType } from '../../record-decision/additional-information/schemas'
import { PatchDecisionController } from '../../base/patchDecisionController'
import { getMaxCharsAndThresholdForAppend, getTextForApiSubmission } from '../../../../utils/appendFieldUtils'

export class UpdateAdditionalInformationController extends PatchDecisionController {
  GET = async (req: Request, res: Response) => {
    const currentAdditionalInfo = req.journeyData.csipRecord!.referral.decisionAndActions!.actionOther
    res.render('record-decision/additional-information/view', {
      currentAdditionalInfo,
      actionOther: res.locals.formResponses?.['actionOther'],
      isUpdate: true,
      recordUuid: req.journeyData.csipRecord!.recordUuid,
      ...getMaxCharsAndThresholdForAppend(res.locals.user.displayName, currentAdditionalInfo),
      backUrl: '../update-decision',
    })
  }

  checkSubmitToAPI = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) =>
    this.submitChanges({
      req,
      next,
      changes: {
        actionOther: getTextForApiSubmission(
          req.journeyData.decisionAndActions!.actionOther,
          res.locals.user.displayName,
          req.body.actionOther,
        ),
      },
    })

  POST = async (req: Request, res: Response) => {
    res.redirect(`/csip-records/${req.journeyData.csipRecord!.recordUuid}`)
  }
}
