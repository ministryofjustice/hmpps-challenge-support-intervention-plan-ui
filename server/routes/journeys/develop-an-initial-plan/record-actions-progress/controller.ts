import { Request, Response } from 'express'
import { format } from 'date-fns'
import { SchemaType } from './schemas'
import { IdentifiedNeed } from '../../../../@types/express'
import { parseIndex } from '../subJourneyUtils'

export class RecordActionsProgressController {
  GET = async (req: Request, res: Response) => {
    const { success, isNew, index } = parseIndex(req)

    if (!success) {
      return res.status(404).redirect('/pages/404')
    }

    const progression =
      res.locals.formResponses?.['progression'] ||
      (isNew
        ? req.journeyData.plan!.identifiedNeedSubJourney?.progression
        : req.journeyData.plan!.identifiedNeeds![index]!.progression)

    const identifiedNeed = isNew
      ? req.journeyData.plan!.identifiedNeedSubJourney!.identifiedNeed
      : req.journeyData.plan!.identifiedNeeds![index]!.identifiedNeed

    return res.render('develop-an-initial-plan/record-actions-progress/view', {
      identifiedNeed,
      progression,
      backUrl: isNew ? `../intervention-details/${index + 1}` : '../identified-needs',
    })
  }

  POST = async (req: Request<Record<string, string>, unknown, SchemaType>, res: Response) => {
    const { success, isNew, index } = parseIndex(req)
    if (!success) {
      return res.status(404).redirect('/pages/404')
    }

    if (isNew) {
      req.journeyData.plan!.identifiedNeeds ??= []
      req.journeyData.plan!.identifiedNeeds!.push({
        ...req.journeyData.plan!.identifiedNeedSubJourney,
        createdDate: format(new Date(), 'yyyy-MM-dd'),
        progression: req.body.progression,
      } as IdentifiedNeed)
      delete req.journeyData.plan!.identifiedNeedSubJourney
    } else {
      req.journeyData.plan!.identifiedNeeds![index]!.progression = req.body.progression
    }

    return res.redirect('../identified-needs')
  }
}
