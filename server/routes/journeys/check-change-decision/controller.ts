import { Request, Response } from 'express'

export class CheckController {
  GET = async (req: Request, res: Response): Promise<void> => {
    if (!req.journeyData.csipRecord?.referral?.decisionAndActions) {
      return res.redirect(`/`)
    }

    return res.render('check-change-decision/view', {
      decisionAndActions: req.journeyData.csipRecord!.referral.decisionAndActions,
      csipRecordUrl: `/csip-records/${req.journeyData.csipRecord!.recordUuid}`,
      backUrl: `/csip-records/${req.journeyData.csipRecord!.recordUuid}`,
    })
  }

  POST = async (_: Request, res: Response): Promise<void> => {
    res.redirect('change-decision')
  }
}
