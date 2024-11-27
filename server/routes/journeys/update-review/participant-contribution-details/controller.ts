import { NextFunction, Request, Response } from 'express'
import { SchemaType } from '../../record-review/participant-contribution-details/schemas'
import { PatchReviewController } from '../../base/patchReviewController'
import { getNonUndefinedProp } from '../../../../utils/utils'

export class AddParticipantContributionDetailsController extends PatchReviewController {
  GET = async (req: Request, res: Response) => {
    res.render('record-review/participant-contribution-details/view', {
      name: res.locals.formResponses?.['name'],
      role: res.locals.formResponses?.['role'],
      isAttended: res.locals.formResponses?.['isAttended'],
      contribution: res.locals.formResponses?.['contribution'],
      isUpdate: true,
      backUrl: '../update-review',
      recordUuid: req.journeyData.csipRecord!.recordUuid,
    })
  }

  checkSubmitToAPI = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) =>
    this.addNewAttendee({
      req,
      res,
      next,
      changes: {
        name: req.body.name,
        role: req.body.role,
        isAttended: req.body.isAttended,
        ...getNonUndefinedProp(req.body, 'contribution'),
      },
    })

  POST = async (req: Request, res: Response) => {
    res.redirect(`/csip-records/${req.journeyData.csipRecord!.recordUuid}`)
  }
}
