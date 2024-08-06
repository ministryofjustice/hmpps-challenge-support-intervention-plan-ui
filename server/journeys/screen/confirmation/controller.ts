import { Request, Response } from 'express'
import { ReferenceData } from '../../../@types/csip/csipApiTypes'

export class ConfirmationController {
  GET = async (req: Request, res: Response) => {
    res.render('screen/confirmation/view', {
      outcomeTypeDescription: req.journeyData.saferCustodyScreening!.outcomeType!.description!,
      outcomeStatus: this.mapOutcomeTypeToStatus(req.journeyData.saferCustodyScreening!.outcomeType!),
      showBreadcrumbs: true,
    })
  }

  private mapOutcomeTypeToStatus(outcomeType: ReferenceData) {
    // TODO: read computed CSIP status from backend instead
    switch (outcomeType.code) {
      case 'CUR':
        return 'plan pending'
      case 'OPE':
        return 'investigation pending'
      default:
        return outcomeType.description
    }
  }
}
