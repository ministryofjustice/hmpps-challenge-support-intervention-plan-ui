import { Request, Response } from 'express'
import { SchemaType } from './schemas'
import { BaseJourneyController } from '../../base/controller'

export class ConclusionController extends BaseJourneyController {
  GET = async (req: Request, res: Response) => {
    const outcomeTypeOptions = this.customRadios(
      await this.getReferenceDataOptionsForRadios(
        req,
        'outcome-type',
        res.locals.formResponses?.['outcome'] || req.journeyData.decisionAndActions!.outcome,
      ),
    )
    res.render('record-decision/conclusion/view', {
      conclusion: res.locals.formResponses?.['conclusion'] || req.journeyData.decisionAndActions?.conclusion,
      outcomeTypeOptions,
      backUrl: '../record-decision',
    })
  }

  private customRadios = (items: { value: string; text: string | undefined }[]) => {
    const nfaIndex = items.findIndex(o => o.value === 'NFA')
    if (nfaIndex > -1) {
      const nfa = items[nfaIndex]!
      items.splice(nfaIndex, 1)
      items.push(nfa)
    }
    const opeIndex = items.findIndex(o => o.value === 'OPE')
    if (opeIndex > -1) {
      items.splice(opeIndex, 1)
    }
    return items
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.decisionAndActions!.conclusion = req.body.conclusion
    res.redirect('next-steps')
  }
}
