import { Request, Response } from 'express'
import { SchemaType } from './schemas'

export class ReferralDescriptionController {
  GET = async (req: Request, res: Response) => {
    res.render('referral/description/view', {
      isProactiveReferral: req.journeyData.referral!.isProactiveReferral,
      descriptionOfConcern:
        res.locals.formResponses?.['descriptionOfConcern'] ?? req.journeyData.referral!.descriptionOfConcern,
      backUrl: 'involvement',
      maxLengthChars: 4000,
      threshold: '75',
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.referral!.descriptionOfConcern = req.body.descriptionOfConcern
    res.redirect('reasons')
  }
}
