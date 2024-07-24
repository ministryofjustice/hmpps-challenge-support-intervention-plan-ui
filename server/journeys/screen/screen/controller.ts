import { Request, Response } from 'express'
import { SchemaType } from './schemas'
import { BaseJourneyController } from '../../base/controller'
import { sortAscending } from '../../../utils/utils'

export class ScreenController extends BaseJourneyController {
  GET = async (req: Request, res: Response): Promise<void> => {
    const outcomeTypeItems = this.sortRadios(
      await this.getReferenceDataOptionsForRadios(
        req,
        'outcome-type',
        res.locals.formResponses?.['outcomeType'] || req.journeyData.saferCustodyScreening?.outcomeType || '',
      ),
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

  private sortRadios = (items: { value: string; text: string | undefined }[]) => {
    // TODO: No need to manually change ACC once ReferenceData DB is updated
    const acct = items.find(o => o.value === 'ACC')
    if (acct) {
      acct.text = 'Support through ACCT'
    }

    items.sort((a, b) => sortAscending(a.text || '', b.text || ''))

    const nfaIndex = items.findIndex(o => o.value === 'NFA')
    if (nfaIndex > -1) {
      const nfa = items[nfaIndex]!
      items.splice(nfaIndex, 1)
      items.push(nfa)
    }
    return items
  }
}
