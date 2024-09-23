import { NextFunction, Request, Response } from 'express'
import { BaseJourneyController } from '../base/controller'
import { SanitisedError } from '../../../sanitisedError'
import { FLASH_KEY__CSIP_SUCCESS_MESSAGE, FLASH_KEY__VALIDATION_ERRORS } from '../../../utils/constants'
import { SchemaType } from './schemas'
import { getNonUndefinedProp } from '../../../utils/utils'

const MESSAGE_LOG_CODE_UPDATED = 'You’ve edited the CSIP log code.'

export class EditLogCodeController extends BaseJourneyController {
  GET = async (req: Request, res: Response) => {
    res.render('edit-log-code/view', {
      logCode: res.locals.formResponses?.['logCode'] ?? req.journeyData.csipRecord!.logCode,
      recordUuid: req.journeyData.csipRecord!.recordUuid,
    })
  }

  checkSubmitToAPI = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) => {
    const csipRecord = req.journeyData.csipRecord!
    try {
      await this.csipApiService.updateCsipRecord(req as Request, {
        logCode: req.body.logCode,
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
          ...getNonUndefinedProp(
            csipRecord.referral,
            'incidentInvolvement',
            incidentInvolvement => (incidentInvolvement as { code: string })?.code,
          ),
        },
      })
    } catch (e) {
      if ((e as SanitisedError).data) {
        const errorRespData = (e as SanitisedError).data as Record<string, string | unknown>
        req.flash(
          FLASH_KEY__VALIDATION_ERRORS,
          JSON.stringify({
            referral: [errorRespData?.['userMessage'] as string],
          }),
        )
      }
      res.redirect('back')
      return
    }
    req.flash(FLASH_KEY__CSIP_SUCCESS_MESSAGE, MESSAGE_LOG_CODE_UPDATED)
    next()
  }

  POST = async (req: Request, res: Response) => {
    res.redirect(`/csip-records/${req.journeyData.csipRecord!.recordUuid}`)
  }
}
