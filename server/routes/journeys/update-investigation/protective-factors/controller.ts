import { NextFunction, Request, Response } from 'express'
import { SchemaType } from '../../record-investigation/protective-factors/schemas'
import { MESSAGE_INVESTIGATION_UPDATED, PatchInvestigationController } from '../../base/patchInvestigationController'
import { getMaxCharsAndThresholdForAppend, getTextForApiSubmission } from '../../../../utils/appendFieldUtils'

export class UpdateProtectiveFactorsController extends PatchInvestigationController {
  GET = async (req: Request, res: Response) => {
    const currentProtectiveFactors = req.journeyData.csipRecord!.referral.investigation!.protectiveFactors
    res.render('record-investigation/protective-factors/view', {
      currentProtectiveFactors,
      protectiveFactors: res.locals.formResponses?.['protectiveFactors'],
      isUpdate: true,
      backUrl: '../update-investigation',
      recordUuid: req.journeyData.csipRecord!.recordUuid,
      ...getMaxCharsAndThresholdForAppend(res.locals.user.displayName, currentProtectiveFactors),
    })
  }

  checkSubmitToAPI = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) =>
    this.submitChanges({
      req,
      res,
      next,
      changes: {
        protectiveFactors: getTextForApiSubmission(
          req.journeyData.investigation!.protectiveFactors,
          res.locals.user.displayName,
          req.body.protectiveFactors,
        ),
      },
      successMessage: MESSAGE_INVESTIGATION_UPDATED,
    })

  POST = this.deleteJourneyDataAndGoBackToCsipRecordPage
}
