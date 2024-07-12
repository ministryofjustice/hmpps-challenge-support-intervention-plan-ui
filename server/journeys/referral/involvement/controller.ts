import { Request, Response } from 'express'
import { SchemaType } from './schemas'
import { BaseJourneyController } from '../../base/controller'

export class InvolvementController extends BaseJourneyController {
  GET = async (req: Request, res: Response): Promise<void> => {
    const items = await this.getReferenceDataOptionsForRadios(
      req,
      'incident-involvement',
      res.locals.formResponses?.['involvementType'] || req.journeyData.referral!.incidentInvolvement,
    )
    // Differentiate between not set, false and true
    const formResponsesStaffAssaulted =
      res.locals.formResponses?.['staffAssaulted'] === undefined
        ? undefined
        : res.locals.formResponses?.['staffAssaulted'] === 'true'

    res.render('referral/involvement/view', {
      involvementTypeItems: items,
      isProactiveReferral: Boolean(req.journeyData.referral!.isProactiveReferral),
      staffAssaulted: formResponsesStaffAssaulted || req.journeyData.referral!.staffAssaulted,
      assaultedStaffName:
        res.locals.formResponses?.['assaultedStaffName'] || req.journeyData.referral!.assaultedStaffName,
      backUrl: true,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response): Promise<void> => {
    if (req.body.involvementType) {
      req.journeyData.referral!.incidentInvolvement = req.body.involvementType
    }
    req.journeyData.referral!.staffAssaulted = req.body.staffAssaulted
    req.journeyData.referral!.assaultedStaffName = req.body.assaultedStaffName

    res.redirect('description')
  }
}
