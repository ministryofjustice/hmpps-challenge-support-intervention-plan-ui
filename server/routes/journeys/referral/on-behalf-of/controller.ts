import { Request, Response } from 'express'
import { SchemaType } from './schemas'
import { CsipRecordStatus } from '../../../../@types/csip/csipApiTypes'
import CsipApiService from '../../../../services/csipApi/csipApiService'

export class ReferralOnBehalfOfController {
  constructor(readonly csipApiService: CsipApiService) {}

  GET = async (req: Request, res: Response) => {
    let currentCsipCode: CsipRecordStatus | '' = ''
    try {
      const currentCsipData = await this.csipApiService.getCurrentCsipRecord(
        req,
        req.journeyData.prisoner!.prisonerNumber,
      )
      currentCsipCode = currentCsipData.currentCsip?.status?.code as CsipRecordStatus
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_err: unknown) {
      res.render('pages/errorServiceProblem', {
        showBreadcrumbs: true,
      })
      return
    }
    const ongoingReferralStatuses: CsipRecordStatus[] = [
      'REFERRAL_SUBMITTED',
      'INVESTIGATION_PENDING',
      'AWAITING_DECISION',
      'PLAN_PENDING',
    ]
    res.render('referral/on-behalf-of/view', {
      isAlreadyOnReferral: ongoingReferralStatuses.includes(currentCsipCode as CsipRecordStatus),
      isAlreadyOnCsip: currentCsipCode === 'CSIP_OPEN',
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
