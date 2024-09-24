import { Request, Response } from 'express'
import type PrisonerSearchService from '../../../services/prisonerSearch/prisonerSearchService'
import { BaseJourneyController } from '../base/controller'
import CsipApiService from '../../../services/csipApi/csipApiService'

export class UpdateInvestigationController extends BaseJourneyController {
  constructor(
    override readonly csipApiService: CsipApiService,
    private readonly prisonerSearchService: PrisonerSearchService,
  ) {
    super(csipApiService)
  }

  UPDATE = async (req: Request, res: Response) => {
    const record = req.journeyData.csipRecord!

    const prisoner = await this.prisonerSearchService.getPrisonerDetails(req, record.prisonNumber)
    const { referral } = record

    const interviews = record.referral!.investigation?.interviews
      ? referral!.investigation!.interviews.sort((intA, intB) => {
          const dif = new Date(intA.interviewDate).getTime() - new Date(intB.interviewDate).getTime()
          if (dif !== 0) {
            return dif
          }
          return intB.interviewText!.localeCompare(intA.interviewText!)
        })
      : undefined

    const investigation = {
      ...record.referral!.investigation,
      ...(interviews && { interviews }),
    }
    req.journeyData.investigation = investigation

    const secondaryButton = {
      label: 'Cancel',
      link: `/csip-record/${record.recordUuid}`,
    }

    req.journeyData.isUpdate = true

    res.render('csip-records/view', {
      newInterviewIndex: (investigation!.interviews || []).length + 1,
      updatingEntity: 'investigation',
      isUpdate: true,
      referralTabSelected: false,
      status: record.status,
      investigation,
      recordUuid: record.recordUuid,
      prisoner,
      showBreadcrumbs: true,
      secondaryButton,
    })
  }
}
