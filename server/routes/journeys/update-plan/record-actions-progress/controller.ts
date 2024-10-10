import { Request, Response } from 'express'
import { SchemaType } from '../../develop-an-initial-plan/record-actions-progress/schemas'

export class NewActionsProgressionController {
  GET = async (req: Request, res: Response) => {
    req.journeyData.plan!.identifiedNeedSubJourney ??= {}

    return res.render('develop-an-initial-plan/record-actions-progress/view', {
      progression:
        res.locals.formResponses?.['progression'] ?? req.journeyData.plan!.identifiedNeedSubJourney!.progression,
      backUrl: 'intervention-details',
      isUpdate: true,
    })
  }

  POST = async (req: Request<Record<string, string>, unknown, SchemaType>, res: Response) => {
    req.journeyData.plan!.identifiedNeedSubJourney!.progression = req.body.progression
    res.redirect('check-answers')
  }
}
