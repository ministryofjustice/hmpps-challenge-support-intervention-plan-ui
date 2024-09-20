import { NextFunction, Request, Response } from 'express'
import { SanitisedError } from '../../../sanitisedError'
import {
  FLASH_KEY__CSIP_SUCCESS_MESSAGE,
  FLASH_KEY__FORM_RESPONSES,
  FLASH_KEY__VALIDATION_ERRORS,
} from '../../../utils/constants'
import { PatchReferralController } from './patchReferralController'
import { ContributoryFactor } from '../../../@types/express'
import { getNonUndefinedProp } from '../../../utils/utils'

export const MESSAGE_REFERRAL_DETAILS_UPDATED = 'You’ve updated the referral details.'
export const MESSAGE_REACTIVE_DETAILS_UPDATED = 'You’ve updated the incident details.'
export const MESSAGE_PROACTIVE_DETAILS_UPDATED = 'You’ve updated the behaviour details.'
export const MESSAGE_REACTIVE_INVOLVEMENT_UPDATED = 'You’ve updated the incident involvement information.'
export const MESSAGE_PROACTIVE_INVOLVEMENT_UPDATED = 'You’ve updated the behaviour involvement information.'
export const MESSAGE_REACTIVE_DESCRIPTION_UPDATED = 'You’ve updated the incident description.'
export const MESSAGE_PROACTIVE_DESCRIPTION_UPDATED = 'You’ve updated the behaviour description.'
export const MESSAGE_CONTRIBUTORY_FACTOR_UPDATED = 'You’ve updated the information on contributory factors.'
export const MESSAGE_REFERRAL_ADDITIONAL_INFO_UPDATED = 'You’ve updated the additional information.'

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
    factorTypeCode: string,
    comment?: string | undefined,
  ) => {
    const selectedCf = this.getSelectedCf(req)

    if (!selectedCf) {
      return res.notFound()
    }

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
