import { Request, Response } from 'express'
import { SchemaType } from './schemas'

export class EvidenceSecuredController {
  GET = async (req: Request, res: Response): Promise<void> => {
    res.render('record-investigation/evidence-secured/view', {
      evidenceSecured:
        res.locals?.formResponses?.['evidenceSecured'] || req.journeyData?.investigation?.evidenceSecured,
      backUrl: '../record-investigation',
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response): Promise<void> => {
    req.journeyData.investigation!.evidenceSecured = req.body.evidenceSecured
    res.redirect('../record-investigation')
  }
}
