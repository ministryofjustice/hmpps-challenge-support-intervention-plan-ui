import { Request, Response } from 'express'
import { SchemaType } from './schemas'
import { BaseJourneyController } from '../../base/controller'
import { formatInputDate } from '../../../utils/datetimeUtils'

export class InterviewDetailsController extends BaseJourneyController {
  GET = async (req: Request, res: Response) => {
    const index = Number(req.params['index']) - 1

    if (Number.isNaN(index) || (req.journeyData.investigation!.interviews || []).length < index) {
      return res.status(404).redirect('/pages/404')
    }

    const intervieweeRoleOptions = await this.getReferenceDataOptionsForRadios(
      req,
      'interviewee-role',
      res.locals.formResponses?.['intervieweeRole'] ||
        req.journeyData.investigation?.interviews?.[index]?.intervieweeRole,
    )
    return res.render('record-investigation/interview-details/view', {
      interviewText:
        res.locals.formResponses?.['interviewText'] || req.journeyData.investigation?.interviews?.[index]?.interviewText,
      intervieweeRoleOptions,
      interviewDate:
        res.locals.formResponses?.['interviewDate'] ||
        formatInputDate(req.journeyData.investigation?.interviews?.[index]?.interviewDate),
      interviewee:
        res.locals.formResponses?.['interviewee'] || req.journeyData.investigation?.interviews?.[index]?.interviewee,
      backUrl: '../interviews-summary',
    })
  }

  POST = async (req: Request<Record<string, string>, unknown, SchemaType>, res: Response) => {
    const index = Number(req.params['index']) - 1

    if (Number.isNaN(index) || (req.journeyData.investigation!.interviews || []).length < index) {
      return res.status(404).redirect('/pages/404')
    }
    
    if (!req.journeyData.investigation?.interviews) {
      req.journeyData.investigation!.interviews = []
    }

req.journeyData.investigation!.interviews?.[index] = {
  interviewee: req.body.interviewee
  interviewDate: req.body.interviewDate
  intervieweeRole: req.body.intervieweeRole
  interviewText: req.body.interviewText
}
      req.journeyData.investigation!.interviews![index] = {}
    }

    return res.redirect('../interviews-summary')
  }
}
