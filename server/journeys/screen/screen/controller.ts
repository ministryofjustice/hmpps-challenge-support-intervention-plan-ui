import { Request, Response } from 'express'
import { SchemaType } from './schemas'
import { BaseJourneyController } from '../../base/controller'

export class ScreenController extends BaseJourneyController {
  GET = async (req: Request, res: Response): Promise<void> => {
    const outcomeTypeItems = await this.getReferenceDataOptionsForRadios(
      req,
      'outcome-type',
      res.locals.formResponses?.['outcomeType'] || req.journeyData.saferCustodyScreening?.outcomeType || '',
    )

    res.render('screen/screen/view', {
      outcomeTypeItems,
      reasonForDecision:
        res.locals.formResponses?.['reasonForDecision'] || req.journeyData.saferCustodyScreening?.reasonForDecision,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response): Promise<void> => {
    req.journeyData.saferCustodyScreening!.outcomeType = req.body.outcomeType
    req.journeyData.saferCustodyScreening!.reasonForDecision = req.body.reasonForDecision
    res.redirect('check-answers')
  }
}
