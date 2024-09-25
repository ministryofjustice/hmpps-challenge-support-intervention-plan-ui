import { NextFunction, Request, Response } from 'express'
import { SchemaType } from '../../record-investigation/why-behaviour-occurred/schemas'
import { MESSAGE_INVESTIGATION_UPDATED, PatchInvestigationController } from '../../base/patchInvestigationController'
import { generateSaveTimestamp, getMaxCharsAndThresholdForAppend } from '../../../../utils/appendFieldUtils'

export class UpdateWhyBehaviourOccurredController extends PatchInvestigationController {
  GET = async (req: Request, res: Response) => {
    req.journeyData.isUpdate = true
    const currentOccurrenceReason = req.journeyData.csipRecord!.referral.investigation!.occurrenceReason
    res.render('record-investigation/why-behaviour-occurred/view', {
      currentOccurrenceReason,
      occurrenceReason: res.locals.formResponses?.['occurrenceReason'],
      isUpdate: true,
      recordUuid: req.journeyData.csipRecord!.recordUuid,
      ...getMaxCharsAndThresholdForAppend(res.locals.user.displayName, currentOccurrenceReason),
    })
  }

  checkSubmitToAPI = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) =>
    this.submitChanges({
      req,
      res,
      next,
      changes: {
        occurrenceReason:
          (req.journeyData.investigation!.occurrenceReason ?? '') +
          generateSaveTimestamp(res.locals.user.displayName) +
          req.body.occurrenceReason,
      },
      successMessage: MESSAGE_INVESTIGATION_UPDATED,
    })

  POST = async (req: Request, res: Response) => {
    res.redirect(`/csip-records/${req.journeyData.csipRecord!.recordUuid}`)
  }
}
