import { Request, Response } from 'express'

export class ConfirmationController {
  GET = async (req: Request, res: Response) => {
    res.render('develop-an-initial-plan/confirmation/view', {
      nextReviewDate: req.journeyData.plan!.nextCaseReviewDate,
      showBreadcrumbs: true,
    })
  }
}
