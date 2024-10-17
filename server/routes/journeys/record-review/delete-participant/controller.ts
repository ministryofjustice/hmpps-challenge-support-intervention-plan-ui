import { Request, Response } from 'express'
import { BaseJourneyController } from '../../base/controller'

export class DeleteParticipantController extends BaseJourneyController {
  GET = async (req: Request, res: Response) => {
    const index = Number(req.params['index']) - 1

    if (isInvalidNeedIndex(index, req)) {
      return res.notFound()
    }

    const attendee = req.journeyData.review!.attendees![index]!

    return res.render('record-review/delete-participant/view', {
      attendee,
      backUrl: '../participants-summary',
    })
  }

  POST = async (req: Request<Record<string, string>>, res: Response) => {
    const index = Number(req.params['index']) - 1

    if (Number.isNaN(index)) {
      return res.notFound()
    }

    req.journeyData.review!.attendees!.splice(index, 1)

    return res.redirect('../participants-summary')
  }
}

const isInvalidNeedIndex = (index: number | undefined, req: Request) => {
  return Number.isNaN(index) || Number(index) > (req.journeyData.review?.attendees || []).length - 1
}
