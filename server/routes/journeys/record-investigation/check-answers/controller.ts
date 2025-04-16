import { NextFunction, Request, Response } from 'express'
import { BaseJourneyController } from '../../base/controller'
import CsipApiService from '../../../../services/csipApi/csipApiService'
import AuditService from '../../../../services/auditService'

export class InvestigationCheckAnswersController extends BaseJourneyController {
  constructor(
    override readonly csipApiService: CsipApiService,
    private readonly auditService: AuditService,
  ) {
    super(csipApiService)
  }

  GET = async (req: Request, res: Response) => {
    req.journeyData.isCheckAnswers = true

    const { investigation } = req.journeyData
    res.render('record-investigation/check-answers/view', {
      investigation,
      csipRecordUrl: `/csip-records/${req.journeyData.csipRecord!.recordUuid}`,
      showBreadcrumbs: true,
    })
  }

  checkSubmitToAPI = async (req: Request, res: Response, next: NextFunction) => {
    const investigation = req.journeyData.investigation!
    try {
      await this.auditService.logModificationApiCall(
        'ATTEMPT',
        'CREATE',
        'INVESTIGATION',
        req.originalUrl,
        req.journeyData,
        res.locals.auditEvent,
      )
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
        recordedBy: res.locals.user.username,
        recordedByDisplayName: res.locals.user.displayName,
      })
      req.journeyData.journeyCompleted = true
      await this.auditService.logModificationApiCall(
        'SUCCESS',
        'CREATE',
        'INVESTIGATION',
        req.originalUrl,
        req.journeyData,
        res.locals.auditEvent,
      )
      next()
    } catch (e) {
      next(e)
    }
  }

  POST = async (_req: Request, res: Response) => {
    res.redirect('confirmation')
  }
}
