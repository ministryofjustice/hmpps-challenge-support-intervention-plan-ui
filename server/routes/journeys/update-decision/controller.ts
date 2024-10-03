import { Request, Response } from 'express'
import type PrisonerSearchService from '../../../services/prisonerSearch/prisonerSearchService'
import { BaseJourneyController } from '../base/controller'
import CsipApiService from '../../../services/csipApi/csipApiService'
import { getNonUndefinedProp } from '../../../utils/utils'

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
      return res.redirect(`/csip-records/${record.recordUuid}`)
    }

    const prisoner = await this.prisonerSearchService.getPrisonerDetails(req, record.prisonNumber)
    const decision = record.referral!.decisionAndActions!

    req.journeyData.decisionAndActions = {
      ...getNonUndefinedProp(decision, 'conclusion'),
      ...getNonUndefinedProp(decision, 'actionOther'),
      ...getNonUndefinedProp(decision, 'nextSteps'),
    }
    req.journeyData.isUpdate = true

    const secondaryButton = {
      label: 'Cancel',
      link: `/csip-records/${record.recordUuid}`,
    }

    return res.render('csip-records/view', {
      tabSelected: 'investigation',
      updatingEntity: 'investigation decision',
      isUpdate: true,
      referralTabSelected: false,
      status: record.status,
      decision,
      recordUuid: record.recordUuid,
      prisoner,
      showBreadcrumbs: true,
      secondaryButton,
    })
  }
}
