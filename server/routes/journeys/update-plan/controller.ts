import { NextFunction, Request, Response } from 'express'
import type PrisonerSearchService from '../../../services/prisonerSearch/prisonerSearchService'
import { BaseJourneyController } from '../base/controller'
import CsipApiService from '../../../services/csipApi/csipApiService'
import { getNonUndefinedProp } from '../../../utils/utils'
import { identifiedNeedSorter } from '../../../utils/sorters'
import { components } from '../../../@types/csip'
import { FLASH_KEY__CSIP_SUCCESS_MESSAGE } from '../../../utils/constants'

export class UpdatePlanController extends BaseJourneyController {
  constructor(
    override readonly csipApiService: CsipApiService,
    private readonly prisonerSearchService: PrisonerSearchService,
  ) {
    super(csipApiService)
  }

  submitChanges = async <T>({
    req,
    next,
    changes,
    successMessage,
  }: {
    req: Request<unknown, unknown, T>
    next: NextFunction
    changes: Partial<components['schemas']['UpdatePlanRequest']>
    successMessage: string
  }) => {
    const csipRecord = req.journeyData.csipRecord!

    try {
      await this.csipApiService.updatePlan(req as Request, {
        ...getNonUndefinedProp(csipRecord.plan!, 'caseManager'),
        ...getNonUndefinedProp(csipRecord.plan!, 'reasonForPlan'),
        ...getNonUndefinedProp(csipRecord.plan!, 'firstCaseReviewDate'),
        ...getNonUndefinedProp(csipRecord.plan!, 'reviews'),
        ...getNonUndefinedProp(csipRecord.plan!, 'identifiedNeeds'),
        ...changes,
      })
      req.flash(FLASH_KEY__CSIP_SUCCESS_MESSAGE, successMessage)
      next()
    } catch (e) {
      next(e)
    }
  }

  UPDATE = async (req: Request, res: Response) => {
    const record = req.journeyData.csipRecord!
    if (record.status !== 'CSIP_OPEN' || !record.plan) {
      return res.redirect(`/csip-records/${record.recordUuid}`)
    }

    const prisoner = await this.prisonerSearchService.getPrisonerDetails(req, record.prisonNumber)
    const plan = record.plan!

    req.journeyData.plan = {
      ...getNonUndefinedProp(plan, 'caseManager'),
      ...getNonUndefinedProp(plan, 'reasonForPlan'),
      ...getNonUndefinedProp(plan, 'firstCaseReviewDate'),
      identifiedNeeds: (plan.identifiedNeeds || []).sort(identifiedNeedSorter).map(need => ({
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
      tabSelected: 'plan',
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
