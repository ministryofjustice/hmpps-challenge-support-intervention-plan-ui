import { Request, Response } from 'express'
import { SchemaType } from './schemas'

export class ProtectiveFactorsController {
  GET = async (req: Request, res: Response) => {
    const protectiveFactors =
      res.locals.formResponses?.['protectiveFactors'] ?? req.journeyData.investigation?.protectiveFactors
    res.render('record-investigation/protective-factors/view', {
      protectiveFactors,
      backUrl: '../record-investigation',
      maxLengthChars: 4000,
      threshold: '75',
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.investigation!.protectiveFactors = req.body.protectiveFactors
    res.redirect('../record-investigation')
  }
}
