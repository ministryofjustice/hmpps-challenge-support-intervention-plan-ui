import { NextFunction, Request, Response } from 'express'
import { PatchReferralController } from '../../base/patchReferralController'
import {
  FLASH_KEY__CSIP_SUCCESS_MESSAGE,
  FLASH_KEY__FORM_RESPONSES,
  FLASH_KEY__VALIDATION_ERRORS,
} from '../../../../utils/constants'
import { SanitisedError } from '../../../../sanitisedError'
import { getNonUndefinedProp } from '../../../../utils/utils'
import { ContributoryFactor } from '../../../../@types/express'

export class UpdateContributoryFactorsController extends PatchReferralController {
  private getSelectedCf = (req: Request): ContributoryFactor | undefined => {
    const uuid = req.baseUrl
      .split('/')
      .pop()
      ?.match(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/)?.[0]

    if (!uuid) {
      return undefined
    }

    return req.journeyData.referral!.contributoryFactors?.find(factors => factors.factorUuid === uuid)
  }

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

    try {
      await this.csipApiService.updateContributoryFactor(req, selectedCf.factorUuid!, {
        factorTypeCode: req.body.contributoryFactor.code,
        ...getNonUndefinedProp(selectedCf, 'comment'),
      })
    } catch (e) {
      if ((e as SanitisedError).data) {
        const errorRespData = (e as SanitisedError).data as Record<string, string | unknown>
        req.flash(
          FLASH_KEY__VALIDATION_ERRORS,
          JSON.stringify({
            referral: [errorRespData?.['userMessage'] as string],
          }),
        )
        req.flash(FLASH_KEY__FORM_RESPONSES, JSON.stringify(req.body))
      }
      return res.redirect('back')
    }

    req.flash(FLASH_KEY__CSIP_SUCCESS_MESSAGE, 'You’ve updated the information on contributory factors.')
    return next()
  }

  POST = async (req: Request, res: Response) => {
    res.redirect(`/csip-records/${req.journeyData.csipRecord!.recordUuid}`)
  }
}
