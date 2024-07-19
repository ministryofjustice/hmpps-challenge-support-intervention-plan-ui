import { Request, Response } from 'express'
import { SchemaType } from './schemas'
import { BaseJourneyController } from '../../base/controller'

export class InvolvementController extends BaseJourneyController {
  GET = async (req: Request, res: Response): Promise<void> => {
    const items = this.customOrderRadios(
      await this.getReferenceDataOptionsForRadios(
        req,
        'incident-involvement',
        res.locals.formResponses?.['involvementType'] || req.journeyData.referral!.incidentInvolvement,
      ),
    )
    // Differentiate between not set, false and true
    const formResponsesStaffAssaulted =
      res.locals.formResponses?.['staffAssaulted'] === undefined
        ? undefined
        : res.locals.formResponses?.['staffAssaulted'] === 'true'

    res.render('referral/involvement/view', {
      involvementTypeItems: items,
      isProactiveReferral: Boolean(req.journeyData.referral!.isProactiveReferral),
      staffAssaulted: formResponsesStaffAssaulted ?? req.journeyData.referral!.staffAssaulted,
      assaultedStaffName:
        res.locals.formResponses?.['assaultedStaffName'] || req.journeyData.referral!.assaultedStaffName,
      backUrl: 'details',
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response): Promise<void> => {
    req.journeyData.referral!.incidentInvolvement = req.body.involvementType
    req.journeyData.referral!.staffAssaulted = req.body.staffAssaulted
    req.journeyData.referral!.assaultedStaffName = req.body.assaultedStaffName

    console.log('submit involvement')

    res.redirect('description')
  }

  /** Moves 'Other' to the bottom of the list */
  private customOrderRadios = (items: { value: string; text: string | undefined }[]) => {
    const othIndex = items.findIndex(o => o.value === 'OTH')
    if (othIndex > -1) {
      const oth = items[othIndex]!
      items.splice(othIndex, 1)
      items.push(oth)
    }
    return items
  }
}
