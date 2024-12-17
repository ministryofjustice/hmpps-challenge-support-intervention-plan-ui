import { Request, Response } from 'express'
import { BaseJourneyController } from '../../base/controller'
import { SchemaType } from './schemas'

export class ReferralContributoryFactorsController extends BaseJourneyController {
  GET = async (req: Request, res: Response) => {
    let contributoryFactorCheckboxes = await this.getReferenceDataOptionsForCheckboxes(
      req,
      'contributory-factor-type',
      res.locals.formResponses?.['contributoryFactors'] ||
        req.journeyData.referral!.contributoryFactors?.map(factors => factors.factorType.code),
    )

    const hiddenExistingCFs: typeof contributoryFactorCheckboxes = []
    if (req.journeyData.referral?.continuingReferral) {
      contributoryFactorCheckboxes = contributoryFactorCheckboxes.map(cf => {
        if (cf.checked) {
          hiddenExistingCFs.push(cf)
        }
        return {
          ...cf,
          disabled: cf.checked,
        }
      })
    }
    res.render('referral/contributory-factors/view', {
      hiddenExistingCFs,
      contributoryFactorCheckboxes,
      backUrl: 'reasons',
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.referral!.contributoryFactors = req.body.contributoryFactors.map(
      factor =>
        req.journeyData.referral!.contributoryFactors?.find(itm => itm.factorType.code === factor.factorType.code) ||
        factor,
    )
    res.redirect('contributory-factors-comments')
  }
}
