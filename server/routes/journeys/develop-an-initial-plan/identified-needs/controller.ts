import { Request, Response } from 'express'

export class IdentifiedNeedsController {
  GET = async (req: Request, res: Response) => {
    const { identifiedNeeds, reasonForPlan } = req.journeyData.plan!

    res.render('develop-an-initial-plan/identified-needs/view', {
      backUrl: false,
      newNeedIndex: (identifiedNeeds || []).length + 1,
      identifiedNeeds,
      reasonForPlan,
    })
  }

  POST = async (_req: Request, res: Response) => {
    res.redirect('next-review-date')
  }
}
