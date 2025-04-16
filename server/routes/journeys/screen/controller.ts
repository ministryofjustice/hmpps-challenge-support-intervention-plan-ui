import { Request, Response } from 'express'
import { SchemaType } from './schemas'
import { BaseJourneyController } from '../base/controller'

export class ScreenController extends BaseJourneyController {
  GET = async (req: Request, res: Response) => {
    const outcomeTypeItems = await this.getReferenceDataOptionsForRadios(
      req,
      'screening-outcome-type',
      res.locals.formResponses?.['outcomeType'] ?? req.journeyData.saferCustodyScreening?.outcomeType,
    )

    res.render('screen/view', {
      outcomeTypeItems,
      reasonForDecision:
        res.locals.formResponses?.['reasonForDecision'] ?? req.journeyData.saferCustodyScreening?.reasonForDecision,
      backUrl: req.journeyData.isCheckAnswers
        ? 'check-answers'
        : `/csip-records/${req.journeyData.csipRecord?.recordUuid}`,
      backUrlText: req.journeyData.isCheckAnswers ? 'Back' : 'Back to CSIP record',
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.saferCustodyScreening!.outcomeType = req.body.outcomeType
    req.journeyData.saferCustodyScreening!.reasonForDecision = req.body.reasonForDecision
    res.redirect('screen/check-answers')
  }
}
