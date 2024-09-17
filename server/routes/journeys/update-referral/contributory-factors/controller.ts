import { NextFunction, Request, Response } from 'express'
import { SchemaType } from '../../referral/contributory-factors/schemas'
import { MESSAGE_REFERRAL_DETAILS_UPDATED, PatchReferralController } from '../../base/patchReferralController'

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

  checkSubmitToAPI = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) =>
    this.submitChanges({
      req,
      res,
      next,
      changes: {},
      successMessage: MESSAGE_REFERRAL_DETAILS_UPDATED,
    })

  POST = async (req: Request, res: Response) => {
    res.redirect(`/csip-records/${req.journeyData.csipRecord!.recordUuid}`)
  }
}
