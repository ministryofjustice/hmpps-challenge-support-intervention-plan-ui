import { Request, Response } from 'express'
import { SchemaType } from './schemas'

export class EvidenceSecuredController {
  GET = async (req: Request, res: Response) => {
    const evidenceSecured =
      res.locals.formResponses?.['evidenceSecured'] || req.journeyData.investigation?.evidenceSecured
    res.render('record-investigation/evidence-secured/view', {
      evidenceSecured,
      backUrl: '../record-investigation',
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.investigation!.evidenceSecured = req.body.evidenceSecured
    res.redirect('../record-investigation')
  }
}
