import { Request, Response } from 'express'

import CsipApiService from '../../services/csipApi/csipApiService'
import PrisonerSearchService from '../../services/prisonerSearch/prisonerSearchService'
import { components } from '../../@types/csip'

const hasInvestigation = (status: components['schemas']['CsipRecord']['status']) => {
  return !(['REFERRAL_PENDING', 'REFERRAL_SUBMITTED', 'INVESTIGATION_PENDING'] as (typeof status)[]).includes(status)
}

export class CsipRecordController {
  constructor(
    private readonly csipApiService: CsipApiService,
    private readonly prisonerSearchService: PrisonerSearchService,
  ) {}

  GET_BASE = async (req: Request, res: Response) => {
    const { recordUuid } = req.params
    const record = await this.csipApiService.getCsipRecord(req, recordUuid!)

    if (hasInvestigation(record.status)) {
      res.redirect(`/csip-records/${recordUuid}/investigation`)
      return
    }
    res.redirect(`/csip-records/${recordUuid}/referral`)
  }

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
    const investigation: Partial<components['schemas']['Investigation']> = {
      ...record.referral!.investigation,
    }

    const interviews = record.referral!.investigation?.interviews
    if (interviews) {
      investigation['interviews'] = interviews.sort((intA, intB) => {
        const dif = new Date(intA.interviewDate).getTime() - new Date(intB.interviewDate).getTime()
        if (dif !== 0) {
          return dif
        }
        return intB.interviewText!.localeCompare(intA.interviewText!)
      })
    }

    const decision = record.referral!.decisionAndActions

    const involvementFilter = (itm: { key: { text: string } }) =>
      referral.assaultedStaffName || itm.key.text !== 'Names of staff assaulted'

    const screening = record.referral!.saferCustodyScreeningOutcome

    let actionButton
    let secondaryButton
    switch (record.status) {
      case 'REFERRAL_PENDING':
        break
      case 'REFERRAL_SUBMITTED':
        actionButton = {
          label: 'Screen referral',
          action: 'screen',
        }
        secondaryButton = {
          label: 'Update referral',
          link: 'update-referral',
        }
        break
      case 'PLAN_PENDING':
        actionButton = {
          label: 'Develop initial plan',
          action: 'plan',
        }
        break
      case 'INVESTIGATION_PENDING':
        actionButton = {
          label: 'Record investigation',
          action: 'investigation',
        }
        break
      case 'SUPPORT_OUTSIDE_CSIP':
      case 'ACCT_SUPPORT':
      case 'NO_FURTHER_ACTION':
      case 'AWAITING_DECISION':
        actionButton = {
          label: 'Record decision',
          action: 'decision',
        }
        break
      case 'CSIP_OPEN':
        actionButton = {
          label: 'Record CSIP review',
          action: 'review',
        }
        break
      case 'CSIP_CLOSED':
      case 'UNKNOWN':
      default:
        break
    }

    const referralTabSelected = req.url.endsWith('referral')

    res.render('csip-records/view', {
      status: record.status,
      shouldShowTabs: hasInvestigation(record.status),
      decision,
      investigation,
      recordUuid,
      referralTabSelected,
      actionButton,
      prisoner,
      referral,
      screening,
      involvementFilter,
      showBreadcrumbs: true,
      secondaryButton,
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
      case 'plan':
        res.redirect(`/csip-record/${recordUuid}/develop-an-initial-plan/start`)
        break
      case 'decision':
        res.redirect(`/csip-record/${recordUuid}/record-decision/start`)
        break
      case 'review':
        res.redirect(`back`)
        break
      default:
        res.redirect('back')
    }
  }
}
