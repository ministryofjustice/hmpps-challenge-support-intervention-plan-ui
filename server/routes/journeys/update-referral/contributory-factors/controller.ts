import { NextFunction, Request, Response } from 'express'
import { PatchReferralController } from '../../base/patchReferralController'
import { FLASH_KEY__CSIP_SUCCESS_MESSAGE } from '../../../../utils/constants'

export class UpdateContributoryFactorsController extends PatchReferralController {
  GET = async (req: Request, res: Response) => {
    const uuid = req.baseUrl
      .split('/')
      .pop()
      ?.match(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/)?.[0]
    if (!uuid) {
      return res.notFound()
    }

    const contributoryFactorCheckboxes = await this.getReferenceDataOptionsForRadios(
      req,
      'contributory-factor-type',
      res.locals.formResponses?.['contributoryFactors'] ||
        req.journeyData.referral!.contributoryFactors?.find(factors => factors.factorUuid === uuid)?.factorType.code,
    )

    const cf = req.journeyData.referral!.contributoryFactors!.find(factors => factors.factorUuid === uuid)
    const { referral } = req.journeyData.csipRecord!

    return res.render('update-referral/contributory-factors/view', {
      isUpdate: true,
      recordUuid: req.journeyData.csipRecord!.recordUuid,
      contributoryFactorCheckboxes: contributoryFactorCheckboxes.filter(
        o =>
          cf?.factorType.code === o.value ||
          !referral.contributoryFactors.find(factor => factor.factorType.code === o.value),
      ),
    })
  }

  checkSubmitToAPI = async (req: Request, res: Response, next: NextFunction) => {
    const uuid = req.baseUrl
      .split('/')
      .pop()
      ?.match(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/)?.[0]

    if (!uuid) {
      return res.notFound()
    }

    req.flash(FLASH_KEY__CSIP_SUCCESS_MESSAGE, 'You’ve updated the information on contributory factors.')
    return next()
  }

  POST = async (req: Request, res: Response) => {
    res.redirect(`/csip-records/${req.journeyData.csipRecord!.recordUuid}`)
  }
}
