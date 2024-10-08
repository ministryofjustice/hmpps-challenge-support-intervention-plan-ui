import { Request, Response } from 'express'
import { SchemaType } from '../../develop-an-initial-plan/intervention-details/schemas'
import { formatInputDate } from '../../../../utils/datetimeUtils'

export class NewInterventionDetailsController {
  GET = async (req: Request, res: Response) => {
    req.journeyData.plan!.identifiedNeedSubJourney ??= {}

    return res.render('develop-an-initial-plan/intervention-details/view', {
      identifiedNeed: req.journeyData.plan!.identifiedNeedSubJourney!.identifiedNeed,
      targetDate:
        res.locals.formResponses?.['targetDate'] ??
        formatInputDate(req.journeyData.plan!.identifiedNeedSubJourney!.targetDate),
      responsiblePerson:
        res.locals.formResponses?.['responsiblePerson'] ??
        req.journeyData.plan!.identifiedNeedSubJourney!.responsiblePerson,
      intervention:
        res.locals.formResponses?.['intervention'] ?? req.journeyData.plan!.identifiedNeedSubJourney!.intervention,
      backUrl: 'summarise-identified-need',
      isUpdate: true,
    })
  }

  POST = async (req: Request<Record<string, string>, unknown, SchemaType>, res: Response) => {
    req.journeyData.plan!.identifiedNeedSubJourney!.intervention = req.body.intervention
    req.journeyData.plan!.identifiedNeedSubJourney!.responsiblePerson = req.body.responsiblePerson
    req.journeyData.plan!.identifiedNeedSubJourney!.targetDate = req.body.targetDate
    res.redirect('record-actions-progress')
  }
}
