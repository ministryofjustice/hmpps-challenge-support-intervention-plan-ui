import { Request, Response } from 'express'
import { BaseJourneyController } from '../base/controller'
import { SchemaType } from '../record-decision/schemas'

export class ChangeDecisionController extends BaseJourneyController {
  GET = async (req: Request, res: Response) => {
    const signedOffByRoleOptions = await this.getReferenceDataOptionsForRadios(
      req,
      'role',
      res.locals.formResponses?.['signedOffByRole'] ?? req.journeyData.decisionAndActions!.signedOffByRole,
    )

    res.render('record-decision/view', {
      backUrlText: 'Back to CSIP referral',
      backUrl: `/csip-records/${req.journeyData.csipRecord!.recordUuid}`,
      changeDecision: true,
      signedOffByRoleOptions,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.decisionAndActions!.signedOffByRole = req.body.signedOffByRole
    res.redirect('change-decision/conclusion')
  }
}
