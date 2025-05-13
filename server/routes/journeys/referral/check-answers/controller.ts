import { NextFunction, Request, Response } from 'express'
import { BaseJourneyController } from '../../base/controller'
import AuditService from '../../../../services/auditService'
import CsipApiService from '../../../../services/csipApi/csipApiService'

export class ReferralCheckAnswersController extends BaseJourneyController {
  constructor(
    override readonly csipApiService: CsipApiService,
    private readonly auditService: AuditService,
  ) {
    super(csipApiService)
  }

  GET = async (req: Request, res: Response) => {
    req.journeyData.isCheckAnswers = true
    delete req.journeyData.referral!.onBehalfOfSubJourney

    const { referral } = req.journeyData
    res.render('referral/check-answers/view', { referral, showBreadcrumbs: true })
  }

  checkSubmitToAPI = async (req: Request, res: Response, next: NextFunction) => {
    const prisoner = req.journeyData.prisoner!
    const referral = req.journeyData.referral!

    const referralBody = {
      contributoryFactors: referral.contributoryFactors!.map(factor => ({
        factorTypeCode: factor.factorType.code,
        ...(factor.comment !== undefined && { comment: factor.comment }),
        ...(factor.factorUuid && { factorUuid: factor.factorUuid }),
      })),
      incidentDate: referral.incidentDate!,
      incidentLocationCode: referral.incidentLocation!.code,
      incidentTypeCode: referral.incidentType!.code,
      refererAreaCode: referral.refererArea!.code,
      referredBy: referral.referredBy!,
      ...(typeof referral.assaultedStaffName === 'string' && { assaultedStaffName: referral.assaultedStaffName }),
      descriptionOfConcern: referral.descriptionOfConcern!,
      incidentInvolvementCode: referral.incidentInvolvement!.code,
      ...(referral.incidentTime && { incidentTime: referral.incidentTime }),
      isProactiveReferral: referral.isProactiveReferral!,
      isSaferCustodyTeamInformed: referral.isSaferCustodyTeamInformed!,
      isReferralComplete: true,
      isStaffAssaulted: referral.isStaffAssaulted!,
      knownReasons: referral.knownReasons!,
      ...(typeof referral.otherInformation === 'string' && { otherInformation: referral.otherInformation }),
    }
    try {
      if (referral.continuingReferral) {
        await this.auditService.logModificationApiCall(
          'ATTEMPT',
          'PUT',
          'REFERRAL',
          `/csip-records/${req.journeyData.csipRecord!.recordUuid}/referral`,
          req.journeyData,
          res.locals.auditEvent,
        )
        await this.csipApiService.mergeReferral(req, referralBody)
        await this.auditService.logModificationApiCall(
          'SUCCESS',
          'PUT',
          'REFERRAL',
          `/csip-records/${req.journeyData.csipRecord!.recordUuid}/referral`,
          req.journeyData,
          res.locals.auditEvent,
        )
      } else {
        await this.auditService.logModificationApiCall(
          'ATTEMPT',
          'POST',
          'REFERRAL',
          `/prisoners/${req.journeyData.prisoner!.prisonerNumber}/csip-records`,
          req.journeyData,
          res.locals.auditEvent,
        )
        await this.csipApiService.createReferral(req, {
          logCode: prisoner.prisonId,
          referral: referralBody,
        })
        await this.auditService.logModificationApiCall(
          'SUCCESS',
          'POST',
          'REFERRAL',
          `/prisoners/${req.journeyData.prisoner!.prisonerNumber}/csip-records`,
          req.journeyData,
          res.locals.auditEvent,
        )
      }
      req.journeyData.journeyCompleted = true
      next()
    } catch (e) {
      next(e)
    }
  }

  POST = async (_req: Request, res: Response): Promise<void> => {
    res.redirect('confirmation')
  }
}
