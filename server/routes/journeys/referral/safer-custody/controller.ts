import { Request, Response } from 'express'
import { SchemaType } from './schemas'

export class ReferralSaferCustodyController {
  GET = async (req: Request, res: Response) => {
    const isSaferCustodyTeamInformed =
      res.locals.formResponses?.['isSaferCustodyTeamInformed'] ?? req.journeyData.referral!.isSaferCustodyTeamInformed
    res.render('referral/safer-custody/view', {
      isSaferCustodyTeamInformed,
      backUrl: 'contributory-factors-comments',
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.referral!.isSaferCustodyTeamInformed = req.body.isSaferCustodyTeamInformed
    res.redirect('additional-information')
  }
}
