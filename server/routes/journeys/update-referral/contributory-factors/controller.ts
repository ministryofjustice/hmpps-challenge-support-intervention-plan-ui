import { NextFunction, Request, Response } from 'express'
import { PatchReferralController } from '../../base/patchReferralController'
import {
  FLASH_KEY__CSIP_SUCCESS_MESSAGE,
  FLASH_KEY__FORM_RESPONSES,
  FLASH_KEY__VALIDATION_ERRORS,
} from '../../../../utils/constants'
import { SanitisedError } from '../../../../sanitisedError'

export class UpdateContributoryFactorsController extends PatchReferralController {
  GET = async (req: Request, res: Response) => {
    const uuid = req.baseUrl
      .split('/')
      .pop()
      ?.match(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/)?.[0]
    if (!uuid) {
      return res.notFound()
    }

    const contributoryFactorOptions = await this.getReferenceDataOptionsForRadios(
      req,
      'contributory-factor-type',
      res.locals.formResponses?.['contributoryFactor'] ||
        req.journeyData.referral!.contributoryFactors?.find(factors => factors.factorUuid === uuid)?.factorType.code,
    )

    const cf = req.journeyData.referral!.contributoryFactors!.find(factors => factors.factorUuid === uuid)
    const { referral } = req.journeyData.csipRecord!

    return res.render('update-referral/contributory-factors/view', {
      isUpdate: true,
      recordUuid: req.journeyData.csipRecord!.recordUuid,
      contributoryFactorOptions: contributoryFactorOptions.filter(
        o =>
          cf?.factorType.code === o.value ||
          !referral.contributoryFactors.find(factor => factor.factorType.code === o.value),
      ),
    })
  }

  checkSubmitToAPI = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const uuid = req.baseUrl
      .split('/')
      .pop()
      ?.match(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/)?.[0]

    if (!uuid) {
      return res.notFound()
    }

    const comment = req.journeyData.referral!.contributoryFactors!.find(factors => factors.factorUuid === uuid)?.comment

    try {
      await this.csipApiService.updateContributoryFactor(req, uuid, {
        factorTypeCode: req.body.contributoryFactor.code,
        ...((comment && { comment }) || []),
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
