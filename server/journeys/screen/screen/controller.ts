import { Request, Response } from 'express'
import { SchemaType } from './schemas'
import { BaseJourneyController } from '../../base/controller'

export class ScreenController extends BaseJourneyController {
  GET = async (req: Request, res: Response): Promise<void> => {
    const saferCustodyOutcomeItems = await this.getReferenceDataOptionsForRadios(
      req,
      'outcome-type',
      req.journeyData.saferCustodyScreening?.outcomeType || '',
    )

    res.render('screen/screen/view', {
      saferCustodyOutcomeItems,
      reasonForDecision: req.journeyData.saferCustodyScreening!.reasonForDecision,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response): Promise<void> => {
    req.journeyData.saferCustodyScreening!.outcomeType = req.body['saferCustodyOutcome']
    req.journeyData.saferCustodyScreening!.reasonForDecision = req.body['reasonForDecision']
    res.redirect('check-answers')
  }
}
