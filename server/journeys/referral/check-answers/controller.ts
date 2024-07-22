import { Request, RequestHandler, Response } from 'express'
import { BaseJourneyController } from '../../base/controller'
import { SanitisedError } from '../../../sanitisedError'

export class ReferralCheckAnswersController extends BaseJourneyController {
  GET = async (req: Request, res: Response): Promise<void> => {
    req.journeyData.isCheckAnswers = true
    delete req.journeyData.referral!.onBehalfOfSubJourney

    const { referral } = req.journeyData
    const referrerDetailsFilter = (itm: { key: { text: string } }) =>
      referral!.isOnBehalfOfReferral || itm.key.text !== 'Name of referrer'

    const involvementFilter = (itm: { key: { text: string } }) =>
      referral!.assaultedStaffName || itm.key.text !== 'Names of staff assaulted'

    res.render(
      req.journeyData.referral!.isProactiveReferral
        ? 'referral/check-answers/view-proactive'
        : 'referral/check-answers/view-reactive',
      { referral, referrerDetailsFilter, involvementFilter },
    )
  }

  checkSubmitToAPI: RequestHandler = async (req, res, next) => {
    const { prisoner, referral } = req.journeyData
    if (!prisoner || !referral) {
      const prisonerEmpty = !prisoner
      throw new Error(`${prisonerEmpty ? 'Prisoner' : 'Referral'} in journeyData was empty!`)
    }
    try {
      await this.createReferral(req, {
        logNumber: prisoner.prisonId,
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
          incidentTime: `${referral.incidentTime!}:00`,
          isProactiveReferral: referral.isProactiveReferral!,
          // @ts-expect-error asd
          isSaferCustodyTeamInformed: 'YES',
          isReferralComplete: true,
          isStaffAssaulted: referral.staffAssaulted!,
          knownReasons: referral.knownReasons!,
          ...(typeof referral.otherInformation === 'string' && { otherInformation: referral.otherInformation }),
        },
      })
      req.journeyData.csipRecordCreated = true
    } catch (e) {
      if ((e as SanitisedError)['data']) {
        const errorRespData = (e as SanitisedError)['data'] as Record<string, string | unknown>
        req.flash(
          'validationErrors',
          JSON.stringify({
            referral: [errorRespData?.['userMessage'] as string],
          }),
        )
      }
      res.redirect('back')
      return
    }
    next()
  }

  POST = async (_req: Request, res: Response): Promise<void> => {
    res.redirect('confirmation')
  }
}
