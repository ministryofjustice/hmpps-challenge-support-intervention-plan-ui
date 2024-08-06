import { Request, Response } from 'express'
import { SchemaType } from './schemas'

export class ReferralDescriptionController {
  GET = async (req: Request, res: Response) => {
    const descriptionOfConcern =
      res.locals.formResponses?.['descriptionOfConcern'] || req.journeyData.referral!.descriptionOfConcern
    res.render(
      req.journeyData.referral!.isProactiveReferral
        ? 'referral/description/view-proactive'
        : 'referral/description/view-reactive',
      {
        descriptionOfConcern,
        backUrl: 'involvement',
      },
    )
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.referral!.descriptionOfConcern = req.body.descriptionOfConcern
    res.redirect('reasons')
  }
}
