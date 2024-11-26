import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { SchemaType } from './schemas'
import { PatchPlanController } from '../../base/patchPlanController'
import { getMaxCharsAndThresholdForAppend, getTextForApiSubmission } from '../../../../utils/appendFieldUtils'

export class UpdatePlannedInterventionController extends PatchPlanController {
  GET = async (req: Request, res: Response) => {
    const identifiedNeed = this.getSelectedIdentifiedNeed(req)
    const currentIntervention = identifiedNeed?.intervention
    res.render('update-plan/planned-intervention/view', {
      currentIntervention,
      intervention: res.locals.formResponses?.['intervention'],
      isUpdate: true,
      backUrl: '../identified-needs',
      recordUuid: req.journeyData.csipRecord!.recordUuid,
      ...getMaxCharsAndThresholdForAppend(res.locals.user.displayName, currentIntervention),
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
        intervention: getTextForApiSubmission(
          identifiedNeed?.intervention,
          res.locals.user.displayName,
          req.body.intervention,
        ),
      },
      identifiedNeedUuid: identifiedNeedUuid!,
    })
  }

  POST = async (req: Request, res: Response) => {
    res.redirect(`/csip-records/${req.journeyData.csipRecord!.recordUuid}`)
  }
}
