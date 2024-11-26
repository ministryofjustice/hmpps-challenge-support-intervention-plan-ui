import { NextFunction, Request, Response } from 'express'
import { SchemaType } from '../../develop-an-initial-plan/summarise-identified-need/schemas'
import { PatchPlanController } from '../../base/patchPlanController'

export class UpdateIdentifiedNeedController extends PatchPlanController {
  GET = async (req: Request, res: Response) => {
    const identifiedNeed = this.getSelectedIdentifiedNeed(req)

    if (!identifiedNeed) {
      return res.notFound()
    }

    return res.render('update-plan/update-identified-need/view', {
      identifiedNeed: res.locals.formResponses?.['identifiedNeed'] ?? identifiedNeed.identifiedNeed,
      backUrl: '../identified-needs',
      recordUuid: req.journeyData.csipRecord!.recordUuid,
      isUpdate: true,
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
        identifiedNeed: req.body.identifiedNeed,
      },
      identifiedNeedUuid: identifiedNeed.identifiedNeedUuid!,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    res.redirect(`/csip-records/${req.journeyData.csipRecord!.recordUuid}`)
  }
}
