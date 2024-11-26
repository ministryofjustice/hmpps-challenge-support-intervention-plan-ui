import { NextFunction, Request, Response } from 'express'
import { SchemaType } from './schemas'
import { PatchPlanController } from '../../base/patchPlanController'
import { formatDateConcise } from '../../../../utils/datetimeUtils'

export class UpdateInterventionDetailsController extends PatchPlanController {
  GET = async (req: Request, res: Response) => {
    const identifiedNeed = this.getSelectedIdentifiedNeed(req as Request)

    if (!identifiedNeed) {
      return res.notFound()
    }

    return res.render('update-plan/update-intervention-details/view', {
      identifiedNeed: identifiedNeed.identifiedNeed,
      responsiblePerson: res.locals.formResponses?.['responsiblePerson'] ?? identifiedNeed.responsiblePerson,
      targetDate: res.locals.formResponses?.['targetDate'] ?? formatDateConcise(identifiedNeed.targetDate),
      recordUuid: req.journeyData.csipRecord!.recordUuid,
      backUrl: '../identified-needs',
    })
  }

  checkSubmitToAPI = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) => {
    const identifiedNeed = this.getSelectedIdentifiedNeed(req as Request)

    if (!identifiedNeed) {
      return res.notFound()
    }
    return this.submitIdentifiedNeedChanges({
      req,
      res,
      next,
      changes: {
        responsiblePerson: req.body.responsiblePerson,
        targetDate: req.body.targetDate,
      },
      identifiedNeedUuid: identifiedNeed.identifiedNeedUuid!,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    res.redirect(`/csip-records/${req.journeyData.csipRecord!.recordUuid}`)
  }
}
