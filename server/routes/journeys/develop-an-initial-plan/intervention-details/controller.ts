import { Request, Response } from 'express'
import { SchemaType } from './schemas'
import { formatInputDate } from '../../../../utils/datetimeUtils'
import { parseIndex } from '../subJourneyUtils'
import { IdentifiedNeed } from '../../../../@types/express'

export class InterventionDetailsController {
  GET = async (req: Request, res: Response) => {
    const { success, isNew, index } = parseIndex(req)

    if (!success) {
      return res.status(404).redirect('/pages/404')
    }

    return res.render('develop-an-initial-plan/intervention-details/view', {
      identifiedNeeds: this.getData(req, res, 'identifiedNeed', isNew, index),
      targetDate: this.getData<string | undefined>(req, res, 'targetDate', isNew, index, formatInputDate),
      responsiblePerson: this.getData(req, res, 'responsiblePerson', isNew, index),
      intervention: this.getData(req, res, 'intervention', isNew, index),
      backUrl: 'summarise-identified-need',
    })
  }

  private getData = <T>(
    req: Request,
    res: Response,
    key: keyof IdentifiedNeed,
    isNew: boolean,
    index: number,
    transform: (val?: T) => T = val => val as T,
  ) => {
    if (res.locals.formResponses?.[key]) {
      return res.locals.formResponses?.[key] as T
    }

    return transform(
      (isNew
        ? req.journeyData.plan!.identifiedNeedSubJourney?.[key]
        : req.journeyData.plan!.identifiedNeeds![index]![key]) as T,
    )
  }

  POST = async (req: Request<Record<string, string>, unknown, SchemaType>, res: Response) => {
    const { success, isNew, index } = parseIndex(req)

    if (!success) {
      return res.status(404).redirect('/pages/404')
    }

    if (isNew) {
      req.journeyData.plan!.identifiedNeedSubJourney ??= {}
      req.journeyData.plan!.identifiedNeedSubJourney.intervention = req.body.intervention
      req.journeyData.plan!.identifiedNeedSubJourney.responsiblePerson = req.body.responsiblePerson
      req.journeyData.plan!.identifiedNeedSubJourney.targetDate = req.body.targetDate
      return res.redirect(`../record-actions-progress/${index + 1}`)
    }

    req.journeyData.plan!.identifiedNeeds![index]!.intervention = req.body.intervention
    req.journeyData.plan!.identifiedNeeds![index]!.responsiblePerson = req.body.responsiblePerson
    req.journeyData.plan!.identifiedNeeds![index]!.targetDate = req.body.targetDate
    return res.redirect(`../record-actions-progress/${index + 1}`)
  }
}
