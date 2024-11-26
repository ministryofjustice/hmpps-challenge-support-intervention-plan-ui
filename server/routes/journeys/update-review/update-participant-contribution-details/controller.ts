import { NextFunction, Request, Response } from 'express'
import { SchemaType } from '../../record-review/participant-contribution-details/schemas'
import { PatchReviewController } from '../../base/patchReviewController'
import { Attendee } from '../../../../@types/express'
import { getNonUndefinedProp } from '../../../../utils/utils'

export class UpdateAttendeeController extends PatchReviewController {
  GET = async (req: Request, res: Response) => {
    const attendee = this.getSelectedAttendee(req)

    if (!attendee) {
      return res.notFound()
    }

    let attendeeIsAttended: string | undefined
    if (attendee.isAttended !== undefined) {
      attendeeIsAttended = attendee.isAttended ? 'true' : 'false'
    }

    return res.render('record-review/participant-contribution-details/view', {
      name: res.locals.formResponses?.['name'] ?? attendee.name,
      role: res.locals.formResponses?.['role'] ?? attendee.role,
      isAttended: res.locals.formResponses?.['isAttended'] ?? attendeeIsAttended,
      contribution: res.locals.formResponses?.['contribution'] ?? attendee.contribution,
      isUpdate: true,
      backUrl: '../../update-review',
      recordUuid: req.journeyData.csipRecord!.recordUuid,
    })
  }

  checkSubmitToAPI = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) => {
    const attendee = this.getSelectedAttendee(req as Request)

    if (!attendee) {
      return res.notFound()
    }

    return this.submitAttendeeChanges({
      req,
      res,
      next,
      attendeeUuid: attendee.attendeeUuid!,
      changes: {
        name: req.body.name,
        role: req.body.role,
        isAttended: req.body.isAttended,
        ...getNonUndefinedProp(req.body, 'contribution'),
      },
    })
  }

  POST = async (req: Request, res: Response) => {
    res.redirect(`/csip-records/${req.journeyData.csipRecord!.recordUuid}`)
  }

  private getSelectedAttendee = (req: Request): Attendee | undefined => {
    const { attendeeUuid } = req.params
    return req.journeyData.review?.attendees?.find(attendee => attendee.attendeeUuid === attendeeUuid)
  }
}
