import { Request, Response } from 'express'

export class CheckController {
  GET = async (req: Request, res: Response): Promise<void> => {
    if (!req.journeyData.csipRecord?.referral?.saferCustodyScreeningOutcome) {
      return res.redirect(`/`)
    }

    return res.render('check-change-screen/view', {
      saferCustodyScreening: req.journeyData.csipRecord!.referral.saferCustodyScreeningOutcome,
      csipRecordUrl: `/csip-records/${req.journeyData.csipRecord!.recordUuid}`,
      backUrl: `/csip-records/${req.journeyData.csipRecord!.recordUuid}`,
    })
  }

  POST = async (_: Request, res: Response): Promise<void> => {
    res.redirect('change-screen')
  }
}
