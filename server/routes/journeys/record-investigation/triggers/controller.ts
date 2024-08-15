import { Request, Response } from 'express'
import { SchemaType } from './schemas'

export class TriggersController {
  GET = async (req: Request, res: Response) => {
    const personsTrigger = res.locals.formResponses?.['personsTrigger'] || req.journeyData.investigation?.personsTrigger
    res.render('record-investigation/triggers/view', {
      personsTrigger,
      backUrl: '../record-investigation',
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.investigation!.personsTrigger = req.body.personsTrigger
    res.redirect('../record-investigation')
  }
}
