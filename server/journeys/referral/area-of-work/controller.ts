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
    res.render('referral/area-of-work/view', { areaOfWorkOptions })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    req.journeyData.referral ??= {}
    req.journeyData.referral.areaOfWorkCode = req.body['areaOfWork']
    res.redirect('/referral/proactive-or-reactive')
  }
}
