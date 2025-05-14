import { NextFunction, Request, Response } from 'express'
import { FLASH_KEY__CSIP_SUCCESS_MESSAGE } from '../../../utils/constants'
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
      await this.auditService.logModificationApiCall(
        'ATTEMPT',
        'PATCH',
        'CONTRIBUTORY_FACTOR',
        `/csip-records/referral/contributory-factors/${selectedCf.factorUuid!}`,
        req.journeyData,
        res.locals.auditEvent,
      )
      await this.csipApiService.updateContributoryFactor(req, selectedCf.factorUuid!, {
        factorTypeCode,
        ...getNonUndefinedProp({ comment: comment || selectedCf.comment }, 'comment'),
      })
      req.flash(FLASH_KEY__CSIP_SUCCESS_MESSAGE, MESSAGE_CONTRIBUTORY_FACTOR_UPDATED)
      await this.auditService.logModificationApiCall(
        'SUCCESS',
        'PATCH',
        'CONTRIBUTORY_FACTOR',
        `/csip-records/referral/contributory-factors/${selectedCf.factorUuid!}`,
        req.journeyData,
        res.locals.auditEvent,
      )
      next()
    } catch (e) {
      next(e)
    }
  }
}
