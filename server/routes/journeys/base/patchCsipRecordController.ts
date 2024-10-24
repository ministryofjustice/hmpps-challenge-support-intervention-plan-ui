import { NextFunction, Request } from 'express'
import { BaseJourneyController } from './controller'
import { components } from '../../../@types/csip'
import { getNonUndefinedProp } from '../../../utils/utils'
import { FLASH_KEY__CSIP_SUCCESS_MESSAGE } from '../../../utils/constants'

export class PatchCsipRecordController extends BaseJourneyController {
  submitCsipChanges = async <T>({
    req,
    next,
    changes,
    successMessage,
  }: {
    req: Request<unknown, unknown, T>
    next: NextFunction
    changes: Omit<components['schemas']['UpdateCsipRecordRequest'], 'referral'> & {
      referral?: Partial<components['schemas']['UpdateReferral']>
    }
    successMessage: string
  }) => {
    const csipRecord = req.journeyData.csipRecord!

    try {
      await this.csipApiService.updateCsipRecord(req as Request, {
        ...getNonUndefinedProp(changes, 'logCode'),
        referral: {
          incidentDate: csipRecord.referral.incidentDate,
          referredBy: csipRecord.referral.referredBy,
          isSaferCustodyTeamInformed: csipRecord.referral.isSaferCustodyTeamInformed,
          refererAreaCode: csipRecord.referral.refererArea.code,
          incidentLocationCode: csipRecord.referral.incidentLocation.code,
          incidentTypeCode: csipRecord.referral.incidentType.code,
          ...getNonUndefinedProp(csipRecord.referral, 'incidentTime'),
          ...getNonUndefinedProp(csipRecord.referral, 'isProactiveReferral'),
          ...getNonUndefinedProp(csipRecord.referral, 'isStaffAssaulted'),
          ...getNonUndefinedProp(csipRecord.referral, 'assaultedStaffName'),
          ...getNonUndefinedProp(csipRecord.referral, 'descriptionOfConcern'),
          ...getNonUndefinedProp(csipRecord.referral, 'knownReasons'),
          ...getNonUndefinedProp(csipRecord.referral, 'otherInformation'),
          ...getNonUndefinedProp(csipRecord.referral, 'isReferralComplete'),
          ...getNonUndefinedProp(
            csipRecord.referral,
            'incidentInvolvement',
            incidentInvolvement => (incidentInvolvement as { code: string })?.code,
            'incidentInvolvementCode',
          ),
          ...(changes.referral ?? {}),
        },
      })
      req.flash(FLASH_KEY__CSIP_SUCCESS_MESSAGE, successMessage)
      next()
    } catch (e) {
      next(e)
    }
  }
}
