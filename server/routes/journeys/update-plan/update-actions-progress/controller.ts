import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { SchemaType } from './schemas'
import { PatchPlanController } from '../../base/patchPlanController'
import { getMaxCharsAndThresholdForAppend, getTextForApiSubmission } from '../../../../utils/appendFieldUtils'

export class UpdateActionsProgressController extends PatchPlanController {
  GET = async (req: Request, res: Response, next: NextFunction) => {
    const identifiedNeed = this.getSelectedIdentifiedNeed(req)

    if (!identifiedNeed) {
      return res.notFound()
    }

    if (identifiedNeed.closedDate) {
      return next(Error(`Identified need with uuid: ${identifiedNeed.identifiedNeedUuid} is already closed`))
    }

    const currentActionsProgress = identifiedNeed?.progression
    return res.render('update-plan/update-actions-progress/view', {
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
      res,
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

  POST = this.deleteJourneyDataAndGoBackToCsipRecordPage
}
