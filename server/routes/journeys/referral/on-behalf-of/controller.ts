import { Request, Response } from 'express'
import { SchemaType } from './schemas'
import { CsipRecordStatus } from '../../../../@types/csip/csipApiTypes'
import CsipApiService from '../../../../services/csipApi/csipApiService'

export class ReferralOnBehalfOfController {
  constructor(readonly csipApiService: CsipApiService) {}

  GET = async (req: Request, res: Response) => {
    const { currentCsip } = await this.csipApiService.getCurrentCsipRecord(
      req,
      req.journeyData.prisoner!.prisonerNumber,
    )
    const onCsipOrOngoingReferralStatuses: CsipRecordStatus[] = [
      'CSIP_OPEN',
      'REFERRAL_SUBMITTED',
      'INVESTIGATION_PENDING',
      'AWAITING_DECISION',
      'PLAN_PENDING',
    ]
    res.render('referral/on-behalf-of/view', {
      showNotificationBanner: onCsipOrOngoingReferralStatuses.includes(currentCsip?.status?.code as CsipRecordStatus),
      isOnBehalfOfReferral: req.journeyData.referral!.onBehalfOfSubJourney
        ? req.journeyData.referral?.onBehalfOfSubJourney?.isOnBehalfOfReferral
        : req.journeyData.referral!.isOnBehalfOfReferral,
      backUrl: req.journeyData.isCheckAnswers ? 'check-answers' : undefined,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.referral!.onBehalfOfSubJourney = { isOnBehalfOfReferral: req.body.isOnBehalfOfReferral }

    if (req.journeyData.referral!.onBehalfOfSubJourney.isOnBehalfOfReferral) {
      res.redirect('referrer')
      return
    }
    res.redirect('area-of-work')
  }
}
