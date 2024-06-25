import { Request, Response } from 'express'
import CsipApiService from '../../../services/csipApi/csipApiService'

export class ReferralAreaOfWorkController {
  constructor(private readonly csipApiService: CsipApiService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const areaOfWorkOptions = [
      {
        value: '',
        text: 'Select area',
        selected: true,
      },
      ...(await this.csipApiService.getReferenceData(req, 'area-of-work')).map(refData => ({
        value: refData.code,
        text: refData.description,
      })),
    ]
    res.render('referral/area-of-work/view', { areaOfWorkOptions, backUrl: 'on-behalf-of' })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    req.journeyData.referral ??= {}
    req.journeyData.referral.refererArea = (await this.csipApiService.getReferenceData(req, 'area-of-work')).find(
      refData => refData.code === req.body['areaOfWork'],
    )!
    req.journeyData.referral.referredBy = res.locals.user.displayName.substring(0, 240)
    res.redirect('/referral/proactive-or-reactive')
  }
}
