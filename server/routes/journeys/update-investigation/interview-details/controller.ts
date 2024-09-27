import { NextFunction, Request, Response } from 'express'
import { SchemaType } from '../../record-investigation/interview-details/schemas'
import { PatchInvestigationController } from '../../base/patchInvestigationController'
import { formatInputDate } from '../../../../utils/datetimeUtils'
import { getNonUndefinedProp } from '../../../../utils/utils'

export class UpdateInterviewController extends PatchInvestigationController {
  GET = async (req: Request, res: Response) => {
    const index = Number(req.params['index']) - 1

    if (Number.isNaN(index) || (req.journeyData.investigation!.interviews || []).length < index) {
      return res.notFound()
    }

    const intervieweeRoleOptions = await this.getReferenceDataOptionsForRadios(
      req,
      'interviewee-role',
      res.locals.formResponses?.['intervieweeRole'] ??
        req.journeyData.investigation?.interviews?.[index]?.intervieweeRole,
    )

    return res.render('record-investigation/interview-details/view', {
      interviewText:
        res.locals.formResponses?.['interviewText'] ??
        req.journeyData.investigation?.interviews?.[index]?.interviewText,
      intervieweeRoleOptions,
      interviewDate:
        res.locals.formResponses?.['interviewDate'] ??
        formatInputDate(req.journeyData.investigation?.interviews?.[index]?.interviewDate),
      interviewee:
        res.locals.formResponses?.['interviewee'] ?? req.journeyData.investigation?.interviews?.[index]?.interviewee,
      backUrl: '../../update-investigation',
      isUpdate: true,
      recordUuid: req.journeyData.csipRecord!.recordUuid,
    })
  }

  checkSubmitToAPI = async (
    req: Request<Record<string, string>, unknown, SchemaType>,
    res: Response,
    next: NextFunction,
  ) => {
    const index = Number(req.params['index']) - 1

    if (Number.isNaN(index) || (req.journeyData.investigation!.interviews || []).length < index) {
      return res.notFound()
    }

    if (req.journeyData.investigation!.interviews![index]) {
      return this.updateInterview({
        req,
        next,
        body: {
          interviewee: req.body.interviewee,
          interviewDate: req.body.interviewDate,
          intervieweeRoleCode: req.body.intervieweeRole.code,
          ...getNonUndefinedProp(req.body, 'interviewText'),
        },
        interviewUuid: req.journeyData.investigation!.interviews![index].interviewUuid!,
      })
    }

    return this.addInterview({
      req,
      next,
      body: {
        interviewee: req.body.interviewee,
        interviewDate: req.body.interviewDate,
        intervieweeRoleCode: req.body.intervieweeRole.code,
        ...getNonUndefinedProp(req.body, 'interviewText'),
      },
    })
  }

  POST = async (req: Request, res: Response) => {
    res.redirect(`/csip-records/${req.journeyData.csipRecord!.recordUuid}`)
  }
}
