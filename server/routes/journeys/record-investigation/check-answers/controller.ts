import { NextFunction, Request, Response } from 'express'
import { BaseJourneyController } from '../../base/controller'
import { SanitisedError } from '../../../../sanitisedError'

export class InvestigationCheckAnswersController extends BaseJourneyController {
  GET = async (req: Request, res: Response) => {
    req.journeyData.isCheckAnswers = true

    const { investigation } = req.journeyData
    res.render('record-investigation/check-answers/view', {
      investigation,
      csipRecordUrl: `/csip-records/${req.journeyData.csipRecord!.recordUuid}`,
    })
  }

  checkSubmitToAPI = async (req: Request, res: Response, next: NextFunction) => {
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
    } catch (e) {
      if ((e as SanitisedError).data) {
        const errorRespData = (e as SanitisedError).data as Record<string, string | unknown>
        req.flash(
          'validationErrors',
          JSON.stringify({
            saferCustodyScreening: [errorRespData?.['userMessage'] as string],
          }),
        )
      }
      res.redirect('back')
      return
    }
    next()
  }

  POST = async (_req: Request, res: Response) => {
    res.redirect('confirmation')
  }
}
