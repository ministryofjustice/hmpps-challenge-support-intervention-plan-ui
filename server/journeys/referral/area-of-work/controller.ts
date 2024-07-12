import { Request, Response } from 'express'
import { BaseJourneyController } from '../../base/controller'

export class ReferralAreaOfWorkController extends BaseJourneyController {
  GET = async (req: Request, res: Response): Promise<void> => {
    const areaOfWorkOptions = await this.getReferenceDataOptionsForSelect(
      req,
      'area-of-work',
      'Select area',
      res.locals.formResponses?.['refererArea'] || req.journeyData.referral!.refererArea,
    )
    res.render('referral/area-of-work/view', { areaOfWorkOptions, backUrl: 'on-behalf-of' })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    req.journeyData.referral!.refererArea = req.body['areaOfWork']
    req.journeyData.referral!.referredBy = res.locals.user.displayName.substring(0, 240)
    res.redirect('proactive-or-reactive')
  }
}
