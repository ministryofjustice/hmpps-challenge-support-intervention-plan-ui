import { NextFunction, Request, Response } from 'express'
import { BaseJourneyController } from '../../base/controller'
import { SchemaType } from '../../referral/contributory-factor-comment/schemas'
import { FLASH_KEY__CSIP_SUCCESS_MESSAGE } from '../../../../utils/constants'
import { MESSAGE_CONTRIBUTORY_FACTOR_UPDATED } from '../../base/patchReferralController'
import CsipApiService from '../../../../services/csipApi/csipApiService'
import AuditService from '../../../../services/auditService'

export class NewContributoryFactorCommentController extends BaseJourneyController {
  constructor(
    override readonly csipApiService: CsipApiService,
    private readonly auditService: AuditService,
  ) {
    super(csipApiService)
  }

  GET = async (req: Request, res: Response) => {
    res.render('referral/contributory-factor-comment/view', {
      factorDescription: req.journeyData.referral!.contributoryFactorSubJourney!.factorType!.description,
      comment: res.locals.formResponses?.['comment'] ?? req.journeyData.referral!.contributoryFactorSubJourney!.comment,
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
      req.flash(FLASH_KEY__CSIP_SUCCESS_MESSAGE, MESSAGE_CONTRIBUTORY_FACTOR_UPDATED)
      await this.auditService.logModificationApiCall(
        'CREATE',
        'CONTRIBUTORY_FACTOR',
        req.originalUrl,
        req.journeyData,
        res.locals.auditEvent,
      )
      next()
    } catch (e) {
      next(e)
    }
  }

  POST = async (req: Request, res: Response) => {
    res.redirect(`/csip-records/${req.journeyData.csipRecord!.recordUuid}`)
  }
}
