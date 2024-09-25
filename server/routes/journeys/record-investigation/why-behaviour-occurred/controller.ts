import { Request, Response } from 'express'
import { SchemaType } from './schemas'

export class OccurrenceReasonController {
  GET = async (req: Request, res: Response) => {
    const occurrenceReason =
      res.locals.formResponses?.['occurrenceReason'] || req.journeyData.investigation!.occurrenceReason
    res.render('record-investigation/why-behaviour-occurred/view', {
      occurrenceReason,
      backUrl: '../record-investigation',
      maxLengthChars: 4000,
      threshold: '75',
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.investigation!.occurrenceReason = req.body.occurrenceReason
    res.redirect('../record-investigation')
  }
}
