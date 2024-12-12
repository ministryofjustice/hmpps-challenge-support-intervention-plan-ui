import { NextFunction, Request, Response } from 'express'
import { UpdateReferralContributoryFactorController } from '../../base/updateReferralContributoryFactorController'

export class UpdateContributoryFactorsController extends UpdateReferralContributoryFactorController {
  GET = async (req: Request, res: Response) => {
    const selectedCf = this.getSelectedCf(req)

    if (!selectedCf) {
      return res.notFound()
    }

    const contributoryFactorOptions = await this.getReferenceDataOptionsForRadios(
      req,
      'contributory-factor-type',
      res.locals.formResponses?.['contributoryFactor'] || selectedCf.factorType.code,
    )

    const { referral } = req.journeyData.csipRecord!

    return res.render('update-referral/contributory-factor-type/view', {
      isUpdate: true,
      recordUuid: req.journeyData.csipRecord!.recordUuid,
      contributoryFactorOptions: contributoryFactorOptions.filter(
        o =>
          selectedCf.factorType.code === o.value ||
          !referral.contributoryFactors.find(factor => factor.factorType.code === o.value),
      ),
    })
  }

  checkSubmitToAPI = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const selectedCf = this.getSelectedCf(req)

    if (!selectedCf) {
      return res.notFound()
    }

    return this.updateContributoryFactor(req, res, next, selectedCf, req.body.contributoryFactor.code)
  }

  POST = this.deleteJourneyDataAndGoBackToCsipRecordPage
}
