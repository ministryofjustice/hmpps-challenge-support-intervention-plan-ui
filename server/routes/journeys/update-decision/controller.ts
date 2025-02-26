import { Request, Response } from 'express'
import type PrisonerSearchService from '../../../services/prisonerSearch/prisonerSearchService'
import { BaseJourneyController } from '../base/controller'
import CsipApiService from '../../../services/csipApi/csipApiService'
import { shouldAllowChangeDecision } from '../change-decision/routes'

export class UpdateDecisionController extends BaseJourneyController {
  constructor(
    override readonly csipApiService: CsipApiService,
    private readonly prisonerSearchService: PrisonerSearchService,
  ) {
    super(csipApiService)
  }

  UPDATE = async (req: Request, res: Response) => {
    const record = req.journeyData.csipRecord!
    if (!record.referral.decisionAndActions || record.plan) {
      console.log(`IS THERE A PLAN? : ${!!record.plan}`)
      console.log(`IS THERE A REFERRAL? : ${!!record.referral}`)
      console.log(`IS THERE A DECISION? : ${!!record.referral?.decisionAndActions}`)
      return res.redirect(`/csip-records/${record.recordUuid}`)
    }

    const prisoner = await this.prisonerSearchService.getPrisonerDetails(req, record.prisonNumber)
    const decision = record.referral!.decisionAndActions!

    req.journeyData.isUpdate = true

    const secondaryButton = {
      label: 'Cancel',
      link: `/csip-records/${record.recordUuid}`,
    }

    return res.render('csip-records/view', {
      tabSelected: 'investigation',
      updatingEntity: 'investigation decision',
      isUpdate: true,
      changeDecisionEnabled: shouldAllowChangeDecision(record),
      referralTabSelected: false,
      status: record.status.code,
      decision,
      recordUuid: record.recordUuid,
      prisoner,
      showBreadcrumbs: true,
      secondaryButton,
      username: res.locals.user.displayName,
    })
  }
}
