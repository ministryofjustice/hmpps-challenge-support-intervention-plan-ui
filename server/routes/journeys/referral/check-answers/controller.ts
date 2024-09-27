import { NextFunction, Request, Response } from 'express'
import { BaseJourneyController } from '../../base/controller'

export class ReferralCheckAnswersController extends BaseJourneyController {
  GET = async (req: Request, res: Response) => {
    req.journeyData.isCheckAnswers = true
    delete req.journeyData.referral!.onBehalfOfSubJourney

    const { referral } = req.journeyData
    const referrerDetailsFilter = (itm: { key: { text: string } }) =>
      referral!.isOnBehalfOfReferral || itm.key.text !== 'Name of referrer'

    const involvementFilter = (itm: { key: { text: string } }) =>
      referral!.assaultedStaffName || itm.key.text !== 'Names of staff assaulted'

    res.render('referral/check-answers/view', { referral, referrerDetailsFilter, involvementFilter })
  }

  checkSubmitToAPI = async (req: Request, _res: Response, next: NextFunction) => {
    const prisoner = req.journeyData.prisoner!
    const referral = req.journeyData.referral!
    try {
      await this.csipApiService.createReferral(req, {
        logCode: prisoner.prisonId,
        referral: {
          contributoryFactors: referral.contributoryFactors!.map(factor => ({
            factorTypeCode: factor.factorType.code,
            ...(factor.comment !== undefined && { comment: factor.comment }),
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
        },
      })
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
