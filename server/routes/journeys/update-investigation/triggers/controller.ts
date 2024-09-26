import { NextFunction, Request, Response } from 'express'
import { SchemaType } from '../../record-investigation/triggers/schemas'
import { MESSAGE_INVESTIGATION_UPDATED, PatchInvestigationController } from '../../base/patchInvestigationController'
import { getMaxCharsAndThresholdForAppend, getTextForApiSubmission } from '../../../../utils/appendFieldUtils'

export class UpdateTriggersController extends PatchInvestigationController {
  GET = async (req: Request, res: Response) => {
    const currentPersonsTrigger = req.journeyData.csipRecord!.referral.investigation!.personsTrigger
    res.render('record-investigation/triggers/view', {
      currentPersonsTrigger,
      personsTrigger: res.locals.formResponses?.['personsTrigger'],
      isUpdate: true,
      recordUuid: req.journeyData.csipRecord!.recordUuid,
      ...getMaxCharsAndThresholdForAppend(res.locals.user.displayName, currentPersonsTrigger),
    })
  }

  checkSubmitToAPI = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) =>
    this.submitChanges({
      req,
      res,
      next,
      changes: {
        personsTrigger: getTextForApiSubmission(
          req.journeyData.investigation!.personsTrigger,
          res.locals.user.displayName,
          req.body.personsTrigger,
        ),
      },
      successMessage: MESSAGE_INVESTIGATION_UPDATED,
    })

  POST = async (req: Request, res: Response) => {
    res.redirect(`/csip-records/${req.journeyData.csipRecord!.recordUuid}`)
  }
}
