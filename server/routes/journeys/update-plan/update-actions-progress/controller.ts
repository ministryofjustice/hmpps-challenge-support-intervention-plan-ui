import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { SchemaType } from './schemas'
import { PatchPlanController } from '../../base/patchPlanController'
import { getMaxCharsAndThresholdForAppend, getTextForApiSubmission } from '../../../../utils/appendFieldUtils'

export class UpdateActionsProgressController extends PatchPlanController {
  GET = async (req: Request, res: Response) => {
    const identifiedNeed = this.getSelectedIdentifiedNeed(req)
    const currentActionsProgress = identifiedNeed?.progression
    res.render('update-plan/update-actions-progress/view', {
      currentActionsProgress,
      progression: res.locals.formResponses?.['progression'],
      isUpdate: true,
      backUrl: '../identified-needs',
      recordUuid: req.journeyData.csipRecord!.recordUuid,
      ...getMaxCharsAndThresholdForAppend(res.locals.user.displayName, currentActionsProgress),
    })
  }

  checkSubmitToAPI = async (req: Request<ParamsDictionary, unknown, SchemaType>, res: Response, next: NextFunction) => {
    const { identifiedNeedUuid } = req.params
    const identifiedNeed = this.getSelectedIdentifiedNeed(req)
    return this.submitIdentifiedNeedChanges({
      req,
      next,
      changes: {
        progression: getTextForApiSubmission(
          identifiedNeed?.progression,
          res.locals.user.displayName,
          req.body.progression,
        ),
      },
      identifiedNeedUuid: identifiedNeedUuid!,
    })
  }

  POST = async (req: Request, res: Response) => {
    res.redirect(`/csip-records/${req.journeyData.csipRecord!.recordUuid}`)
  }
}
