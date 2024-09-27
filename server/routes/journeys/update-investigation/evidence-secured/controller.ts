import { NextFunction, Request, Response } from 'express'
import { SchemaType } from '../../record-investigation/evidence-secured/schemas'
import { MESSAGE_INVESTIGATION_UPDATED, PatchInvestigationController } from '../../base/patchInvestigationController'
import { getMaxCharsAndThresholdForAppend, getTextForApiSubmission } from '../../../../utils/appendFieldUtils'

export class UpdateEvidenceSecuredController extends PatchInvestigationController {
  GET = async (req: Request, res: Response) => {
    const currentEvidenceSecured = req.journeyData.csipRecord!.referral.investigation!.evidenceSecured
    res.render('record-investigation/evidence-secured/view', {
      currentEvidenceSecured,
      evidenceSecured: res.locals.formResponses?.['evidenceSecured'],
      isUpdate: true,
      backUrl: '../update-investigation',
      recordUuid: req.journeyData.csipRecord!.recordUuid,
      ...getMaxCharsAndThresholdForAppend(res.locals.user.displayName, currentEvidenceSecured),
    })
  }

  checkSubmitToAPI = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) =>
    this.submitChanges({
      req,
      next,
      changes: {
        evidenceSecured: getTextForApiSubmission(
          req.journeyData.investigation!.evidenceSecured,
          res.locals.user.displayName,
          req.body.evidenceSecured,
        ),
      },
      successMessage: MESSAGE_INVESTIGATION_UPDATED,
    })

  POST = async (req: Request, res: Response) => {
    res.redirect(`/csip-records/${req.journeyData.csipRecord!.recordUuid}`)
  }
}
