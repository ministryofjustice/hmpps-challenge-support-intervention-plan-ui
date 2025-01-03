import { Request, Response } from 'express'

export class ConfirmationController {
  GET = async (req: Request, res: Response) => {
    // @ts-expect-error delete non-optional req.journeyData to free up redis memory
    delete req.journeyData
    res.render('develop-an-initial-plan/confirmation/view', {
      showBreadcrumbs: true,
    })
  }
}
