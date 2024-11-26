import { NextFunction, Request, Response } from 'express'
import { SchemaType } from '../../record-investigation/staff-involved/schemas'
import { MESSAGE_INVESTIGATION_UPDATED, PatchInvestigationController } from '../../base/patchInvestigationController'
import { getMaxCharsAndThresholdForAppend, getTextForApiSubmission } from '../../../../utils/appendFieldUtils'

export class UpdateStaffInvolvedController extends PatchInvestigationController {
  GET = async (req: Request, res: Response) => {
    const currentStaffInvolved = req.journeyData.csipRecord!.referral.investigation!.staffInvolved
    res.render('record-investigation/staff-involved/view', {
      currentStaffInvolved,
      staffInvolved: res.locals.formResponses?.['staffInvolved'],
      isUpdate: true,
      backUrl: '../update-investigation',
      recordUuid: req.journeyData.csipRecord!.recordUuid,
      ...getMaxCharsAndThresholdForAppend(res.locals.user.displayName, currentStaffInvolved),
    })
  }

  checkSubmitToAPI = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) =>
    this.submitChanges({
      req,
      res,
      next,
      changes: {
        staffInvolved: getTextForApiSubmission(
          req.journeyData.investigation!.staffInvolved,
          res.locals.user.displayName,
          req.body.staffInvolved,
        ),
      },
      successMessage: MESSAGE_INVESTIGATION_UPDATED,
    })

  POST = async (req: Request, res: Response) => {
    res.redirect(`/csip-records/${req.journeyData.csipRecord!.recordUuid}`)
  }
}
