import { Request, Response } from 'express'
import { SchemaType } from './schemas'
import { BaseJourneyController } from '../../base/controller'

export class InvolvementController extends BaseJourneyController {
  GET = async (req: Request, res: Response): Promise<void> => {
    // req.journeyData.referral ??= {} // TODO: remove
    const items = await this.getReferenceDataOptionsForRadios(
      req,
      'incident-involvement',
      res.locals.formResponses?.['incidentInvolvement'] || req.journeyData.referral!.incidentInvolvement,
    )
    res.render('referral/involvement/behaviour', {
      involvementTypeItems: items,
      staffAssaulted: req.journeyData.referral!.staffAssaulted,
      assaultedStaffName: req.journeyData.referral!.assaultedStaffName,
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
