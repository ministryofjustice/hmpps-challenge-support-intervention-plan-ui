import { Request, Response } from 'express'
import type PrisonerSearchService from '../../../services/prisonerSearch/prisonerSearchService'
import { BaseJourneyController } from '../base/controller'
import CsipApiService from '../../../services/csipApi/csipApiService'
import { interviewSorter } from '../../../utils/sorters'
import { isCsipProcessor } from '../../../authentication/authorisedRoles'

export class UpdateInvestigationController extends BaseJourneyController {
  constructor(
    override readonly csipApiService: CsipApiService,
    private readonly prisonerSearchService: PrisonerSearchService,
  ) {
    super(csipApiService)
  }

  UPDATE = async (req: Request, res: Response) => {
    const record = req.journeyData.csipRecord!
    if (!record.referral.investigation || record.plan || record.referral.decisionAndActions) {
      return res.redirect(`/csip-records/${record.recordUuid}`)
    }

    const prisoner = await this.prisonerSearchService.getPrisonerDetails(req, record.prisonNumber)
    const { referral } = record

    const interviews = record.referral!.investigation?.interviews
      ? referral!.investigation!.interviews.sort(interviewSorter)
      : undefined

    const investigation = {
      ...record.referral!.investigation,
      ...(interviews && { interviews }),
    }
    req.journeyData.investigation = investigation

    const secondaryButton = {
      label: 'Cancel',
      link: `/csip-records/${record.recordUuid}`,
    }

    req.journeyData.isUpdate = true

    return res.render('csip-records/view', {
      tabSelected: 'investigation',
      newInterviewIndex: (investigation!.interviews || []).length + 1,
      updatingEntity: 'investigation',
      isUpdate: true,
      referralTabSelected: false,
      status: record.status.code,
      investigation,
      recordUuid: record.recordUuid,
      prisoner,
      showBreadcrumbs: true,
      secondaryButton,
      isCsipProcessor: isCsipProcessor(res),
    })
  }
}
