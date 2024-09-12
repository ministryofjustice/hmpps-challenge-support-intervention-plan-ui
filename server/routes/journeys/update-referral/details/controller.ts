import { NextFunction, Request, Response } from 'express'
import { SchemaType } from '../../referral/details/schemas'
import {
  MESSAGE_PROACTIVE_DETAILS_UPDATED,
  MESSAGE_REACTIVE_DETAILS_UPDATED,
  PatchReferralController,
} from '../../base/patchReferralController'
import { formatInputDate, formatInputTime } from '../../../../utils/datetimeUtils'
import { getNonUndefinedProp } from '../../../../utils/utils'

export class UpdateReferralDetailsController extends PatchReferralController {
  GET = async (req: Request, res: Response) => {
    const isProactiveReferral = Boolean(req.journeyData.csipRecord!.referral.isProactiveReferral)
    req.journeyData.referral = { isProactiveReferral } // populated to be used by schemas

    const incidentLocationOptions = await this.getReferenceDataOptionsForSelect(
      req,
      'incident-location',
      'Select location',
      res.locals.formResponses?.['incidentLocation'] ?? req.journeyData.csipRecord!.referral.incidentLocation,
    )
    const incidentTypeOptions = await this.getReferenceDataOptionsForSelect(
      req,
      'incident-type',
      isProactiveReferral ? 'Select main concern' : 'Select incident type',
      res.locals.formResponses?.['incidentType'] ?? req.journeyData.csipRecord!.referral.incidentType,
    )
    const incidentDate =
      res.locals.formResponses?.['incidentDate'] ?? formatInputDate(req.journeyData.csipRecord!.referral.incidentDate)

    const [journeyDataHour, journeyDataMinute] = formatInputTime(
      req.journeyData.csipRecord!.referral.incidentTime?.substring(0, 5),
    )
    const hour = res.locals.formResponses?.['hour'] ?? journeyDataHour
    const minute = res.locals.formResponses?.['minute'] ?? journeyDataMinute

    res.render('referral/details/view', {
      isProactiveReferral,
      incidentLocationOptions,
      incidentTypeOptions,
      hour,
      minute,
      incidentDate,
      isUpdate: true,
      recordUuid: req.journeyData.csipRecord!.recordUuid,
    })
  }

  checkSubmitToAPI = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) =>
    this.submitChanges({
      req,
      res,
      next,
      changes: {
        incidentLocationCode: req.body.incidentLocation.code,
        incidentTypeCode: req.body.incidentType.code,
        incidentDate: req.body.incidentDate,
        ...getNonUndefinedProp(req.body, 'incidentTime', incidentTime =>
          incidentTime == null ? null : `${incidentTime}:00`,
        ),
      },
      successMessage: req.journeyData.csipRecord!.referral.isProactiveReferral
        ? MESSAGE_PROACTIVE_DETAILS_UPDATED
        : MESSAGE_REACTIVE_DETAILS_UPDATED,
    })

  POST = async (req: Request, res: Response) => {
    res.redirect(`/csip-records/${req.journeyData.csipRecord!.recordUuid}`)
  }
}
