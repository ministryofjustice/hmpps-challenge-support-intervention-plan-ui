import { Request, Response } from 'express'
import { BaseJourneyController } from '../../base/controller'

export class ReferralReferrerController extends BaseJourneyController {
  GET = async (req: Request, res: Response): Promise<void> => {
    const areaOfWorkOptions = await this.getReferenceDataOptions(
      req,
      'area-of-work',
      'Select area',
      req.journeyData.referral!.refererArea,
    )
    const { referredBy } = req.journeyData.referral!
    res.render('referral/referrer/view', { areaOfWorkOptions, referredBy, backUrl: 'on-behalf-of' })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    req.journeyData.referral!.refererArea = req.body['areaOfWork']
    req.journeyData.referral!.referredBy = req.body['referredBy']
    res.redirect('proactive-or-reactive')
  }
}
