import { NextFunction, Request, Response } from 'express'
import { BaseJourneyController } from '../../base/controller'
import { SchemaType } from '../../referral/contributory-factor-comment/schemas'
import { SanitisedError } from '../../../../sanitisedError'
import { FLASH_KEY__CSIP_SUCCESS_MESSAGE, FLASH_KEY__VALIDATION_ERRORS } from '../../../../utils/constants'
import { MESSAGE_CONTRIBUTORY_FACTOR_UPDATED } from '../../base/patchReferralController'

export class NewContributoryFactorCommentController extends BaseJourneyController {
  GET = async (req: Request, res: Response) => {
    res.render('referral/contributory-factor-comment/view', {
      factorDescription: req.journeyData.referral!.contributoryFactorSubJourney!.factorType!.description,
      comment: res.locals.formResponses?.['comment'] || req.journeyData.referral!.contributoryFactorSubJourney!.comment,
      backUrl: 'add-contributory-factor',
      isUpdate: true,
      recordUuid: req.journeyData.csipRecord!.recordUuid,
    })
  }

  checkSubmitToAPI = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) => {
    try {
      await this.csipApiService.addContributoryFactor(req as Request, {
        factorTypeCode: req.journeyData.referral!.contributoryFactorSubJourney!.factorType!.code!,
        ...(req.body.comment ? { comment: req.body.comment } : {}),
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
      }
      res.redirect('back')
      return
    }
    req.flash(FLASH_KEY__CSIP_SUCCESS_MESSAGE, MESSAGE_CONTRIBUTORY_FACTOR_UPDATED)
    next()
  }

  POST = async (req: Request, res: Response) => {
    res.redirect(`/csip-records/${req.journeyData.csipRecord!.recordUuid}`)
  }
}
