import { Request, Response } from 'express'

export class CancelController {
  constructor(
    private readonly journeyType: string,
    private readonly journeyCaption: string,
    private readonly action: string,
  ) {}

  GET = async (req: Request, res: Response) => {
    res.render('cancellation-check/view', {
      showBreadcrumbs: true,
      cancelUrl: req.journeyData.csipRecord ? `/csip-records/${req.journeyData.csipRecord!.recordUuid}` : '/',
      journeyType: this.journeyType,
      journeyCaption: this.journeyCaption,
      action: this.action,
      backUrl: 'check-answers',
    })
  }
}
