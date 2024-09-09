import { NextFunction, Request, Response } from 'express'
import { BaseJourneyController } from './controller'
import { SanitisedError } from '../../../sanitisedError'
import { getNonUndefinedProp } from '../../../utils/utils'
import { components } from '../../../@types/csip'

export class PatchReferralController extends BaseJourneyController {
  submitChanges = async <T>(
    req: Request<unknown, unknown, T>,
    res: Response,
    next: NextFunction,
    changes: Partial<components['schemas']['UpdateReferral']>,
  ) => {
    const csipRecord = req.journeyData.csipRecord!

    try {
      await this.csipApiService.updateCsipRecord(req as Request, {
        ...getNonUndefinedProp(csipRecord, 'logCode'),
        referral: {
          incidentDate: csipRecord.referral.incidentDate,
          referredBy: csipRecord.referral.referredBy,
          isSaferCustodyTeamInformed: csipRecord.referral.isSaferCustodyTeamInformed,
          refererAreaCode: csipRecord.referral.refererArea.code,
          incidentLocationCode: csipRecord.referral.incidentLocation.code,
          incidentTypeCode: csipRecord.referral.incidentType.code,
          ...getNonUndefinedProp(csipRecord.referral, 'incidentDate'),
          ...getNonUndefinedProp(csipRecord.referral, 'incidentTime'),
          ...getNonUndefinedProp(csipRecord.referral, 'isProactiveReferral'),
          ...getNonUndefinedProp(csipRecord.referral, 'isStaffAssaulted'),
          ...getNonUndefinedProp(csipRecord.referral, 'assaultedStaffName'),
          ...getNonUndefinedProp(csipRecord.referral, 'descriptionOfConcern'),
          ...getNonUndefinedProp(csipRecord.referral, 'knownReasons'),
          ...getNonUndefinedProp(csipRecord.referral, 'otherInformation'),
          ...getNonUndefinedProp(csipRecord.referral, 'isReferralComplete'),
          ...(csipRecord.referral.incidentInvolvement
            ? { incidentInvolvementCode: csipRecord.referral.incidentInvolvement?.code }
            : {}),
          ...changes,
        },
      })
    } catch (e) {
      if ((e as SanitisedError).data) {
        const errorRespData = (e as SanitisedError).data as Record<string, string | unknown>
        req.flash(
          'validationErrors',
          JSON.stringify({
            referral: [errorRespData?.['userMessage'] as string],
          }),
        )
      }
      res.redirect('back')
      return
    }
    next()
  }
}
