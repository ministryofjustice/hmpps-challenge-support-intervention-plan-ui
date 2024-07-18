import { Request, Response } from 'express'
import { BaseJourneyController } from '../../base/controller'
import { formatInputDate, formatInputTime } from '../../../utils/datetimeUtils'

export class ReferralDetailsController extends BaseJourneyController {
  GET = async (req: Request, res: Response): Promise<void> => {
    const incidentLocationOptions = await this.getReferenceDataOptionsForSelect(
      req,
      'incident-location',
      'Select location',
      res.locals.formResponses?.['incidentLocation'] || req.journeyData.referral!.incidentLocation,
    )
    const incidentTypeOptions = await this.getReferenceDataOptionsForSelect(
      req,
      'incident-type',
      req.journeyData.referral!.isProactiveReferral ? 'Select main concern' : 'Select incident type',
      res.locals.formResponses?.['incidentType'] || req.journeyData.referral!.incidentType,
    )
    const incidentDate =
      res.locals.formResponses?.['incidentDate'] || formatInputDate(req.journeyData.referral!.incidentDate)

    const [journeyDataHour, journeyDataMinute] = formatInputTime(req.journeyData.referral!.incidentTime)
    const hour = res.locals.formResponses?.['hour'] || journeyDataHour
    const minute = res.locals.formResponses?.['minute'] || journeyDataMinute

    res.render(
      req.journeyData.referral!.isProactiveReferral
        ? 'referral/details/view-proactive'
        : 'referral/details/view-reactive',
      {
        incidentLocationOptions,
        incidentTypeOptions,
        hour,
        minute,
        incidentDate,
        backUrl: 'proactive-or-reactive',
      },
    )
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    req.journeyData.referral!.incidentLocation = req.body['incidentLocation']
    req.journeyData.referral!.incidentType = req.body['incidentType']
    req.journeyData.referral!.incidentDate = req.body['incidentDate']
    req.journeyData.referral!.incidentTime = req.body['incidentTime']
    res.redirect('involvement')
  }
}