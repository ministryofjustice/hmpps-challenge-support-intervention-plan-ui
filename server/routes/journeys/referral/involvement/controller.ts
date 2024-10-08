import { Request, Response } from 'express'
import { SchemaType } from './schemas'
import { BaseJourneyController } from '../../base/controller'

export class InvolvementController extends BaseJourneyController {
  GET = async (req: Request, res: Response) => {
    const items = await this.getReferenceDataOptionsForRadios(
      req,
      'incident-involvement',
      res.locals.formResponses?.['involvementType'] ?? req.journeyData.referral!.incidentInvolvement,
    )
    // Differentiate between not set, false and true
    const formResponsesStaffAssaulted =
      res.locals.formResponses?.['isStaffAssaulted'] === undefined
        ? undefined
        : res.locals.formResponses?.['isStaffAssaulted'] === 'true'

    res.render('referral/involvement/view', {
      involvementTypeItems: items,
      isProactiveReferral: Boolean(req.journeyData.referral!.isProactiveReferral),
      isStaffAssaulted: formResponsesStaffAssaulted ?? req.journeyData.referral!.isStaffAssaulted,
      assaultedStaffName:
        res.locals.formResponses?.['assaultedStaffName'] ?? req.journeyData.referral!.assaultedStaffName,
      backUrl: 'details',
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.referral!.incidentInvolvement = req.body.involvementType
    req.journeyData.referral!.isStaffAssaulted = req.body.isStaffAssaulted
    req.journeyData.referral!.assaultedStaffName = req.body.assaultedStaffName

    res.redirect('description')
  }
}
