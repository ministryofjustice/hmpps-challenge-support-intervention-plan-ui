import { Request, Response } from 'express'
import { SchemaType } from './schemas'
import { YesNoAnswer } from '../../../@types/csip/csipApiTypes'

export class ReferralSaferCustodyController {
  GET = async (req: Request, res: Response): Promise<void> => {
    const isSaferCustodyTeamInformed =
      res.locals.formResponses?.['isSaferCustodyTeamInformed'] || req.journeyData.referral!.isSaferCustodyTeamInformed
    res.render('referral/safer-custody/view', {
      isSaferCustodyTeamInformed,
      backUrl: 'contributory-factors-comments',
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response): Promise<void> => {
    req.journeyData.referral!.isSaferCustodyTeamInformed = req.body.isSaferCustodyTeamInformed as YesNoAnswer
    res.redirect('additional-information')
  }
}
