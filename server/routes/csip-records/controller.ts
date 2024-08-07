import { Request, Response } from 'express'

import CsipApiService from '../../services/csipApi/csipApiService'
import PrisonerSearchService from '../../services/prisonerSearch/prisonerSearchService'

export class CsipRecordController {
  constructor(
    private readonly csipApiService: CsipApiService,
    private readonly prisonerSearchService: PrisonerSearchService,
  ) {}

  GET = async (req: Request, res: Response) => {
    const { recordUuid } = req.params
    const record = await this.csipApiService.getCsipRecord(req, recordUuid!)
    const prisoner = await this.prisonerSearchService.getPrisonerDetails(req, record.prisonNumber)
    const referral = {
      createdAt: record.createdAt,
      referredBy: record.referral!.referredBy,
      refererArea: record.referral!.refererArea,
      isProactiveReferral: record.referral!.isProactiveReferral,
      incidentLocation: record.referral!.incidentLocation,
      incidentType: record.referral!.incidentType,
      incidentDate: record.referral!.incidentDate,
      incidentTime: record.referral!.incidentTime && record.referral!.incidentTime.substring(0, 5),
      descriptionOfConcern: record.referral!.descriptionOfConcern,
      knownReasons: record.referral!.knownReasons,
      contributoryFactors: record.referral!.contributoryFactors,
      isSaferCustodyTeamInformed: record.referral!.isSaferCustodyTeamInformed,
      otherInformation: record.referral!.otherInformation,
      incidentInvolvement: record.referral!.incidentInvolvement,
      staffAssaulted: record.referral!.isStaffAssaulted,
      assaultedStaffName: record.referral!.assaultedStaffName,
    }

    const involvementFilter = (itm: { key: { text: string } }) =>
      referral.assaultedStaffName || itm.key.text !== 'Names of staff assaulted'

    const screening = record.referral!.saferCustodyScreeningOutcome

    let actionButton
    if (!screening) {
      actionButton = {
        label: 'Screen referral',
        action: 'screen',
      }
    } else if (screening.outcome.code === 'OPE') {
      actionButton = {
        label: 'Record investigation',
        action: 'investigation',
      }
    }

    res.render('csip-records/view', {
      actionButton,
      prisoner,
      referral,
      screening,
      involvementFilter,
      showBreadcrumbs: true,
    })
  }

  POST = async (req: Request, res: Response) => {
    const { recordUuid } = req.params
    const { action } = req.body

    switch (action) {
      case 'screen':
        res.redirect(`/csip-record/${recordUuid}/screen/start`)
        break
      case 'investigation':
        res.redirect(`/csip-record/${recordUuid}/record-investigation/start`)
        break
      default:
        res.redirect('back')
    }
  }
}
