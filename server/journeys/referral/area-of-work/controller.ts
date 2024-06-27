import { Request, Response } from 'express'
import CsipApiService from '../../../services/csipApi/csipApiService'

export class ReferralAreaOfWorkController {
  constructor(private readonly csipApiService: CsipApiService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    req.journeyData.referral ??= {}

    const areaOfWorkOptions = [
      {
        value: '',
        text: 'Select area',
        selected: !req.journeyData.referral.refererArea,
      },
      ...(await this.csipApiService.getReferenceData(req, 'area-of-work')).map(refData => ({
        value: refData.code,
        text: refData.description,
        selected: refData.code === req.journeyData.referral?.refererArea?.code,
      })),
    ]
    res.render('referral/area-of-work/view', { areaOfWorkOptions, backUrl: 'on-behalf-of' })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    req.journeyData.referral ??= {}
    req.journeyData.referral.refererArea = req.body['areaOfWork']
    req.journeyData.referral.referredBy = res.locals.user.displayName.substring(0, 240)
    res.redirect(`/${req.params['journeyId']}/referral/proactive-or-reactive`)
  }
}
