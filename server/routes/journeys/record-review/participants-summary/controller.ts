import { Request, Response } from 'express'

export class ParticipantsSummaryController {
  GET = async (req: Request, res: Response) => {
    res.render('record-review/participants-summary/view', {
      attendees: req.journeyData.review!.attendees || [],
      newAttendeeIndex: (req.journeyData.review!.attendees || []).length + 1,
    })
  }

  POST = async (_req: Request, res: Response) => {
    res.redirect('../record-review')
  }
}
