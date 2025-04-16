import { Request, Response } from 'express'

export class IdentifiedNeedsController {
  GET = async (req: Request, res: Response) => {
    const { identifiedNeeds, reasonForPlan } = req.journeyData.plan!

    const sortedNeeds = identifiedNeeds?.sort((needA, needB) => {
      return new Date(needA.createdDate).getTime() - new Date(needB.createdDate).getTime()
    })

    res.render('develop-an-initial-plan/identified-needs/view', {
      newNeedIndex: (sortedNeeds || []).length + 1,
      identifiedNeeds,
      reasonForPlan,
      backUrl: identifiedNeeds?.length
        ? `../develop-an-initial-plan/record-actions-progress/${(sortedNeeds || []).length}`
        : `../develop-an-initial-plan`,
    })
  }

  POST = async (_req: Request, res: Response) => {
    res.redirect('next-review-date')
  }
}
