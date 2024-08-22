import { Request, Response } from 'express'
import { BaseJourneyController } from '../base/controller'
import { SchemaType } from './schemas'

export class RecordDecisionController extends BaseJourneyController {
  GET = async (req: Request, res: Response) => {
    const signedOffByRoleOptions = this.customRadiosOrder(
      await this.getReferenceDataOptionsForRadios(
        req,
        'role',
        res.locals.formResponses?.['signedOffByRole'] || req.journeyData.decisionAndActions!.signedOffByRole,
      ),
    )

    res.render('record-decision/view', { signedOffByRoleOptions })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.decisionAndActions!.signedOffByRole = req.body.signedOffByRole
    res.redirect('record-decision/conclusion')
  }

  private customRadiosOrder = (items: { value: string; text: string | undefined }[]) => [
    ...items.filter(({ value }) => value === 'CUSTMAN'),
    ...items.filter(({ value }) => value === 'THEHOFF'),
    ...items.filter(({ value }) => !['CUSTMAN', 'THEHOFF', 'OTHER'].includes(value)),
    ...items.filter(({ value }) => value === 'OTHER'),
  ]
}
