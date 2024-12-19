import { Request, Response } from 'express'
import { BaseJourneyController } from '../../base/controller'
import { SchemaType } from './schemas'

export class AddContributoryFactorController extends BaseJourneyController {
  GET = async (req: Request, res: Response) => {
    const contributoryFactorRadios = (
      await this.getReferenceDataOptionsForRadios(
        req,
        'contributory-factor-type',
        res.locals.formResponses?.['factorType'] ||
          req.journeyData.referral!.contributoryFactorSubJourney?.factorType?.code,
      )
    ).filter(
      factor =>
        !req.journeyData.referral!.contributoryFactors!.find(
          existingFactor => existingFactor.factorType.code === factor.value,
        ),
    )
    res.render('update-referral/add-contributory-factor/view', { contributoryFactorRadios })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.referral!.contributoryFactorSubJourney ??= {}
    req.journeyData.referral!.contributoryFactorSubJourney!.factorType = req.body.factorType
    res.redirect(`new-comment`)
  }
}
