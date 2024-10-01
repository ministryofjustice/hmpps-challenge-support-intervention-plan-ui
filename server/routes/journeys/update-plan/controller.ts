import { Request, Response } from 'express'
import type PrisonerSearchService from '../../../services/prisonerSearch/prisonerSearchService'
import { BaseJourneyController } from '../base/controller'
import CsipApiService from '../../../services/csipApi/csipApiService'
import { getNonUndefinedProp } from '../../../utils/utils'
import { identifiedNeedSorter } from '../../../utils/sorters'

export class UpdatePlanController extends BaseJourneyController {
  constructor(
    override readonly csipApiService: CsipApiService,
    private readonly prisonerSearchService: PrisonerSearchService,
  ) {
    super(csipApiService)
  }

  UPDATE = async (req: Request, res: Response) => {
    const record = req.journeyData.csipRecord!
    if (!record.plan) {
      return res.redirect(`/csip-records/${record.recordUuid}`)
    }

    const prisoner = await this.prisonerSearchService.getPrisonerDetails(req, record.prisonNumber)
    const plan = record.plan!

    req.journeyData.plan = {
      ...getNonUndefinedProp(plan, 'caseManager'),
      ...getNonUndefinedProp(plan, 'reasonForPlan'),
      ...getNonUndefinedProp(plan, 'firstCaseReviewDate'),
      identifiedNeeds: plan.identifiedNeeds.sort(identifiedNeedSorter).map(need => ({
        identifiedNeed: need.identifiedNeed,
        responsiblePerson: need.responsiblePerson,
        createdDate: need.createdDate,
        targetDate: need.targetDate,
        intervention: need.intervention,
        closedDate: need.closedDate ?? null,
        progression: need.progression ?? null,
      })),
    }
    req.journeyData.isUpdate = true

    const secondaryButton = {
      label: 'Cancel',
      link: `/csip-records/${record.recordUuid}`,
    }

    return res.render('csip-records/view', {
      updatingEntity: 'investigation decision',
      isUpdate: true,
      referralTabSelected: false,
      status: record.status,
      plan,
      recordUuid: record.recordUuid,
      prisoner,
      showBreadcrumbs: true,
      secondaryButton,
    })
  }
}
