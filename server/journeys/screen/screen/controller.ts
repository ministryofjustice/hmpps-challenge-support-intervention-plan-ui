import { Request, Response } from 'express'
import { SchemaType } from './schemas'
import { BaseJourneyController } from '../../base/controller'

export class ScreenController extends BaseJourneyController {
  GET = async (req: Request, res: Response) => {
    const outcomeTypeItems = this.customOrderRadios(
      await this.getReferenceDataOptionsForRadios(
        req,
        'outcome-type',
        res.locals.formResponses?.['outcomeType'] || req.journeyData.saferCustodyScreening?.outcomeType,
      ),
    )

    res.render('screen/screen/view', {
      outcomeTypeItems,
      reasonForDecision:
        res.locals.formResponses?.['reasonForDecision'] || req.journeyData.saferCustodyScreening?.reasonForDecision,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.saferCustodyScreening!.outcomeType = req.body.outcomeType
    req.journeyData.saferCustodyScreening!.reasonForDecision = req.body.reasonForDecision
    res.redirect('check-answers')
  }

  /** Moves 'No further action' to the bottom of the list */
  private customOrderRadios = (items: { value: string; text: string | undefined }[]) => {
    const nfaIndex = items.findIndex(o => o.value === 'NFA')
    if (nfaIndex > -1) {
      const nfa = items[nfaIndex]!
      items.splice(nfaIndex, 1)
      items.push(nfa)
    }
    return items
  }
}
