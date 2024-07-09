import { Request, Response } from 'express'
import { BaseJourneyController } from '../../base/controller'
import { SchemaType } from './schemas'

export class ReferralContributoryFactorsController extends BaseJourneyController {
  GET = async (req: Request, res: Response): Promise<void> => {
    const contributoryFactorCheckboxes = await this.getReferenceDataOptionsForCheckboxes(
      req,
      'contributory-factor-type',
      res.locals.formResponses?.['contributoryFactors'] ||
        req.journeyData.referral!.contributoryFactors?.map(factors => factors.factorType.code),
    )
    res.render('referral/contributory-factors/view', { contributoryFactorCheckboxes, backUrl: 'reasons' })
  }

  POST = async (req: Request<unknown, SchemaType>, res: Response): Promise<void> => {
    req.journeyData.referral!.contributoryFactors = req.body.contributoryFactors
    res.redirect('contributory-factors-comments')
  }
}
