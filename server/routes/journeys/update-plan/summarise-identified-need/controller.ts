import { Request, Response } from 'express'
import { SchemaType } from '../../develop-an-initial-plan/summarise-identified-need/schemas'

export class NewIdentifiedNeedController {
  GET = async (req: Request, res: Response) => {
    req.journeyData.plan!.identifiedNeedSubJourney ??= {}

    return res.render('develop-an-initial-plan/summarise-identified-need/view', {
      identifiedNeed:
        res.locals.formResponses?.['identifiedNeed'] ?? req.journeyData.plan!.identifiedNeedSubJourney!.identifiedNeed,
      backUrl: '../identified-needs',
      isUpdate: true,
    })
  }

  POST = async (req: Request<Record<string, string>, unknown, SchemaType>, res: Response) => {
    req.journeyData.plan!.identifiedNeedSubJourney!.identifiedNeed = req.body.identifiedNeed
    res.redirect('intervention-details')
  }
}
