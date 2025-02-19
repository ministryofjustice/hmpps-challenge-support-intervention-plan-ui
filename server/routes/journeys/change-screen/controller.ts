import { Request, Response } from 'express'
import { SchemaType } from '../screen/schemas'
import { BaseJourneyController } from '../base/controller'

export class ChangeScreenController extends BaseJourneyController {
  GET = async (req: Request, res: Response) => {
    const outcomeTypeItems = await this.getReferenceDataOptionsForRadios(
      req,
      'screening-outcome-type',
      res.locals.formResponses?.['outcomeType'] ?? req.journeyData.saferCustodyScreening?.outcomeType,
    )

    res.render('screen/view', {
      backUrlText: 'Back to CSIP referral',
      backUrl: `/csip-records/${req.journeyData.csipRecord!.recordUuid}`,
      changeScreen: true,
      outcomeTypeItems,
      reasonForDecision:
        res.locals.formResponses?.['reasonForDecision'] ?? req.journeyData.saferCustodyScreening?.reasonForDecision,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.saferCustodyScreening!.outcomeType = req.body.outcomeType
    req.journeyData.saferCustodyScreening!.reasonForDecision = req.body.reasonForDecision
    res.redirect('change-screen/check-answers')
  }
}
