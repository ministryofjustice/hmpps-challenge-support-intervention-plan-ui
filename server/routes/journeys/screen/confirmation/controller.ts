import { Request, Response } from 'express'

export class ConfirmationController {
  GET = async (req: Request, res: Response) => {
    const { csipRecord } = req.journeyData

    res.render('screen/confirmation/view', {
      outcomeTypeDescription: req.journeyData.saferCustodyScreening!.outcomeType!.description!,
      showBreadcrumbs: true,
      csipRecord,
    })
  }
}
