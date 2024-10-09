import { Request, Response } from 'express'
import { SchemaType } from './schemas'
import { parseIdentifiedNeedIndex } from '../subJourneyUtils'

export class SummariseIdentifiedNeedController {
  GET = async (req: Request, res: Response) => {
    const { success, isNew, index } = parseIdentifiedNeedIndex(req)

    if (!success) {
      return res.notFound()
    }

    const identifiedNeed =
      res.locals.formResponses?.['identifiedNeed'] ||
      (isNew
        ? req.journeyData.plan!.identifiedNeedSubJourney?.identifiedNeed
        : req.journeyData.plan!.identifiedNeeds![index]!.identifiedNeed)

    return res.render('develop-an-initial-plan/summarise-identified-need/view', {
      identifiedNeed,
      backUrl: '../identified-needs',
    })
  }

  POST = async (req: Request<Record<string, string>, unknown, SchemaType>, res: Response) => {
    const { success, isNew, index } = parseIdentifiedNeedIndex(req)
    if (!success) {
      return res.redirect('back')
    }

    if (isNew) {
      req.journeyData.plan!.identifiedNeedSubJourney ??= {}
      req.journeyData.plan!.identifiedNeedSubJourney.identifiedNeed = req.body.identifiedNeed
      return res.redirect(`../intervention-details/${index + 1}`)
    }

    req.journeyData.plan!.identifiedNeeds![index]!.identifiedNeed = req.body.identifiedNeed
    return res.redirect(`../identified-needs`)
  }
}
