import { NextFunction, Request, Response } from 'express'
import { SchemaType } from '../../record-investigation/usual-behaviour-presentation/schemas'
import { MESSAGE_INVESTIGATION_UPDATED, PatchInvestigationController } from '../../base/patchInvestigationController'
import { getMaxCharsAndThresholdForAppend, getTextForApiSubmission } from '../../../../utils/appendFieldUtils'

export class UpdateUsualBehaviourController extends PatchInvestigationController {
  GET = async (req: Request, res: Response) => {
    const currentPersonsUsualBehaviour = req.journeyData.csipRecord!.referral.investigation!.personsUsualBehaviour
    res.render('record-investigation/usual-behaviour-presentation/view', {
      currentPersonsUsualBehaviour,
      personsUsualBehaviour: res.locals.formResponses?.['personsUsualBehaviour'],
      isUpdate: true,
      backUrl: '../update-investigation',
      recordUuid: req.journeyData.csipRecord!.recordUuid,
      ...getMaxCharsAndThresholdForAppend(res.locals.user.displayName, currentPersonsUsualBehaviour),
    })
  }

  checkSubmitToAPI = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) =>
    this.submitChanges({
      req,
      res,
      next,
      changes: {
        personsUsualBehaviour: getTextForApiSubmission(
          req.journeyData.investigation!.personsUsualBehaviour,
          res.locals.user.displayName,
          req.body.personsUsualBehaviour,
        ),
      },
      successMessage: MESSAGE_INVESTIGATION_UPDATED,
    })

  POST = async (req: Request, res: Response) => {
    res.redirect(`/csip-records/${req.journeyData.csipRecord!.recordUuid}`)
  }
}
