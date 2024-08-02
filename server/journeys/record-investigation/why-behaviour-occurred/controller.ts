import { Request, Response } from 'express'
import { SchemaType } from './schemas'

export class OccurrenceReasonController {
  GET = async (req: Request, res: Response): Promise<void> => {
    const occurrenceReason =
      res.locals.formResponses?.['staffInvolved'] || req.journeyData.investigation!.occurrenceReason
    res.render('record-investigation/why-behaviour-occurred/view', {
      occurrenceReason,
      backUrl: '../record-investigation',
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response): Promise<void> => {
    req.journeyData.investigation!.occurrenceReason = req.body.occurrenceReason
    res.redirect('../record-investigation')
  }
}
