import { Request, Response } from 'express'
import { SchemaType } from './schemas'
import { BaseJourneyController } from '../../base/controller'
import { getNonUndefinedProp } from '../../../../utils/utils'

export class ParticipantDetailsController extends BaseJourneyController {
  GET = async (req: Request, res: Response) => {
    const index = Number(req.params['index']) - 1

    if (isInvalidNeedIndex(index, req)) {
      return res.notFound()
    }

    const attendee = req.journeyData.review!.attendees?.[index]

    let attendeeIsAttended: string | undefined
    if (attendee?.isAttended !== undefined) {
      if (attendee?.isAttended === true) {
        attendeeIsAttended = 'true'
      } else {
        attendeeIsAttended = 'false'
      }
    }

    return res.render('record-review/participant-contribution-details/view', {
      name: res.locals.formResponses?.['name'] ?? attendee?.name,
      role: res.locals.formResponses?.['role'] ?? attendee?.role,
      isAttended: res.locals.formResponses?.['isAttended'] ?? attendeeIsAttended,
      contribution: res.locals.formResponses?.['contribution'] ?? attendee?.contribution,
      backUrl: '../participants-summary',
    })
  }

  POST = async (req: Request<Record<string, string>, unknown, SchemaType>, res: Response) => {
    const index = Number(req.params['index']) - 1

    if (isInvalidNeedIndex(index, req)) {
      return res.notFound()
    }

    req.journeyData.review!.attendees ??= []

    req.journeyData.review!.attendees[Number(index)] = {
      name: req.body.name,
      role: req.body.role,
      isAttended: req.body.isAttended,
      ...getNonUndefinedProp(req.body, 'contribution'),
    }

    return res.redirect('../participants-summary')
  }
}

const isInvalidNeedIndex = (index: number | undefined, req: Request) => {
  return Number.isNaN(index) || (req.journeyData.review?.attendees || []).length < Number(index)
}
