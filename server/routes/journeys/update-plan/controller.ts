import { Request, Response } from 'express'
import { BaseJourneyController } from '../base/controller'
import CsipApiService from '../../../services/csipApi/csipApiService'
import { getNonUndefinedProp } from '../../../utils/utils'
import { identifiedNeedSorter } from '../../../utils/sorters'
import { isCsipProcessor } from '../../../authentication/authorisedRoles'

export class UpdatePlanController extends BaseJourneyController {
  constructor(override readonly csipApiService: CsipApiService) {
    super(csipApiService)
  }

  UPDATE = async (req: Request, res: Response) => {
    const record = req.journeyData.csipRecord!
    if (record.status.code !== 'CSIP_OPEN' || !record.plan) {
      return res.redirect(`/csip-records/${record.recordUuid}`)
    }

    const plan = record.plan!

    req.journeyData.plan = {
      ...getNonUndefinedProp(plan, 'caseManager'),
      ...getNonUndefinedProp(plan, 'reasonForPlan'),
      ...getNonUndefinedProp(plan, 'nextCaseReviewDate'),
      identifiedNeeds: plan.identifiedNeeds.sort(identifiedNeedSorter).map(need => ({
        identifiedNeed: need.identifiedNeed,
        responsiblePerson: need.responsiblePerson,
        createdDate: need.createdDate,
        targetDate: need.targetDate,
        intervention: need.intervention,
        closedDate: need.closedDate ?? null,
        progression: need.progression ?? null,
        identifiedNeedUuid: need.identifiedNeedUuid,
      })),
    }
    req.journeyData.isUpdate = true

    const secondaryButton = {
      label: 'Cancel',
      link: `/csip-records/${record.recordUuid}`,
    }

    return res.render('csip-records/view', {
      tabSelected: 'plan',
      updatingEntity: 'plan',
      isUpdate: true,
      referralTabSelected: false,
      status: record.status.code,
      record,
      plan,
      identifiedNeeds: req.journeyData.plan.identifiedNeeds,
      recordUuid: record.recordUuid,
      showBreadcrumbs: true,
      secondaryButton,
      isCsipProcessor: isCsipProcessor(res),
    })
  }
}
