import { NextFunction, Request, Response } from 'express'
import { format } from 'date-fns'
import { BaseJourneyController } from '../../base/controller'
import { components } from '../../../../@types/csip'
import CsipApiService from '../../../../services/csipApi/csipApiService'
import AuditService from '../../../../services/auditService'

export class ReviewCheckAnswersController extends BaseJourneyController {
  constructor(
    override readonly csipApiService: CsipApiService,
    private readonly auditService: AuditService,
  ) {
    super(csipApiService)
  }

  GET = async (req: Request, res: Response) => {
    req.journeyData.isCheckAnswers = true
    delete req.journeyData.review!.outcomeSubJourney

    res.render('record-review/check-answers/view', {
      review: req.journeyData.review,
      closingCsip: req.journeyData.review!.outcome === 'CLOSE_CSIP',
      csipRecordUrl: `/csip-records/${req.journeyData.csipRecord!.recordUuid}`,
      showBreadcrumbs: true,
    })
  }

  checkSubmitToAPI = async (req: Request, res: Response, next: NextFunction) => {
    const review = req.journeyData.review!
    try {
      const action = review.outcome! as components['schemas']['CreateReviewRequest']['actions'][number]
      await this.auditService.logModificationApiCall(
        'ATTEMPT',
        'POST',
        'REVIEW',
        `/csip-records/${req.journeyData.csipRecord!.recordUuid}/plan/reviews`,
        req.journeyData,
        res.locals.auditEvent,
      )
      await this.csipApiService.createReview(req, {
        nextReviewDate: review.nextReviewDate!,
        actions: [action],
        summary: review.summary!,
        ...(action === 'CLOSE_CSIP' ? { csipClosedDate: format(new Date(), 'yyyy-MM-dd') } : {}),
        recordedBy: res.locals.user.username,
        reviewDate: format(new Date(), 'yyyy-MM-dd'),
        recordedByDisplayName: res.locals.user.displayName,
        attendees: review.attendees!.map(attendee => ({
          contribution: attendee.contribution!,
          isAttended: attendee.isAttended!,
          name: attendee.name!,
          role: attendee.role!,
        })),
      })
      req.journeyData.csipRecord = await this.csipApiService.getCsipRecord(req, req.journeyData.csipRecord!.recordUuid)
      req.journeyData.journeyCompleted = true
      await this.auditService.logModificationApiCall(
        'SUCCESS',
        'POST',
        'REVIEW',
        `/csip-records/${req.journeyData.csipRecord!.recordUuid}/plan/reviews`,
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
