import { NextFunction, Request, Response } from 'express'
import { SchemaType } from './schemas'
import { PatchCsipRecordController } from '../base/patchCsipRecordController'

const MESSAGE_LOG_CODE_UPDATED = 'You’ve edited the CSIP log code.'

export class EditLogCodeController extends PatchCsipRecordController {
  GET = async (req: Request, res: Response) => {
    res.render('edit-log-code/view', {
      logCode: res.locals.formResponses?.['logCode'] ?? req.journeyData.csipRecord!.logCode,
      recordUuid: req.journeyData.csipRecord!.recordUuid,
    })
  }

  checkSubmitToAPI = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) =>
    this.submitCsipChanges({
      req,
      res,
      next,
      changes: {
        logCode: req.body.logCode,
      },
      successMessage: MESSAGE_LOG_CODE_UPDATED,
    })

  POST = this.deleteJourneyDataAndGoBackToCsipRecordPage
}
