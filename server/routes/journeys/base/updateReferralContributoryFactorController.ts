import { NextFunction, Request, Response } from 'express'
import { SanitisedError } from '../../../sanitisedError'
import {
  FLASH_KEY__CSIP_SUCCESS_MESSAGE,
  FLASH_KEY__FORM_RESPONSES,
  FLASH_KEY__VALIDATION_ERRORS,
} from '../../../utils/constants'
import { MESSAGE_CONTRIBUTORY_FACTOR_UPDATED, PatchReferralController } from './patchReferralController'
import { ContributoryFactor } from '../../../@types/express'
import { getNonUndefinedProp } from '../../../utils/utils'

export class UpdateReferralContributoryFactorController extends PatchReferralController {
  getSelectedCf = (req: Request): ContributoryFactor | undefined => {
    const uuid = req.params['factorUuid']

    if (!uuid) {
      return undefined
    }

    return req.journeyData.referral!.contributoryFactors?.find(factors => factors.factorUuid === uuid)
  }

  updateContributoryFactor = async (
    req: Request,
    res: Response,
    next: NextFunction,
    selectedCf: ContributoryFactor,
    factorTypeCode: string,
    comment?: string | undefined,
  ) => {
    try {
      await this.csipApiService.updateContributoryFactor(req, selectedCf.factorUuid!, {
        factorTypeCode,
        ...getNonUndefinedProp({ comment: comment || selectedCf.comment }, 'comment'),
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

    req.flash(FLASH_KEY__CSIP_SUCCESS_MESSAGE, MESSAGE_CONTRIBUTORY_FACTOR_UPDATED)
    return next()
  }
}
