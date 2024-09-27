import { NextFunction, Request, Response } from 'express'
import { BaseJourneyController } from '../../base/controller'

export class InvestigationCheckAnswersController extends BaseJourneyController {
  GET = async (req: Request, res: Response) => {
    req.journeyData.isCheckAnswers = true

    const { investigation } = req.journeyData
    res.render('record-investigation/check-answers/view', {
      investigation,
      csipRecordUrl: `/csip-records/${req.journeyData.csipRecord!.recordUuid}`,
    })
  }

  checkSubmitToAPI = async (req: Request, _res: Response, next: NextFunction) => {
    const investigation = req.journeyData.investigation!
    try {
      await this.csipApiService.createInvestigation(req, {
        staffInvolved: investigation.staffInvolved!,
        evidenceSecured: investigation.evidenceSecured!,
        occurrenceReason: investigation.occurrenceReason!,
        personsUsualBehaviour: investigation.personsUsualBehaviour!,
        personsTrigger: investigation.personsTrigger!,
        protectiveFactors: investigation.protectiveFactors!,
        interviews: (investigation.interviews || []).map(interview => ({
          interviewee: interview.interviewee!,
          interviewDate: interview.interviewDate!,
          intervieweeRoleCode: interview.intervieweeRole!.code,
          interviewText: interview.interviewText!,
        })),
      })
      req.journeyData.journeyCompleted = true
      next()
    } catch (e) {
      next(e)
    }
  }

  POST = async (_req: Request, res: Response) => {
    res.redirect('confirmation')
  }
}
