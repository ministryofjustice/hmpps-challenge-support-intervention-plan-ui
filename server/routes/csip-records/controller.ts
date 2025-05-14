import { Request, Response } from 'express'

import CsipApiService from '../../services/csipApi/csipApiService'
import PrisonerSearchService from '../../services/prisonerSearch/prisonerSearchService'
import { FLASH_KEY__CSIP_SUCCESS_MESSAGE } from '../../utils/constants'
import { attendeeSorter, identifiedNeedSorter, interviewSorter } from '../../utils/sorters'
import { isCsipProcessor } from '../../authentication/authorisedRoles'
import { shouldAllowChangeScreen } from '../journeys/change-screen/start/routes'

export class CsipRecordController {
  constructor(
    private readonly csipApiService: CsipApiService,
    private readonly prisonerSearchService: PrisonerSearchService,
  ) {}

  private getRecordInfo = async (req: Request, res: Response) => {
    const { recordUuid } = req.params
    const record = await this.csipApiService.getCsipRecord(req, recordUuid!)
    const prisoner = await this.prisonerSearchService.getPrisonerDetails(req, record.prisonNumber)
    const { referral } = record
    const { investigation } = referral

    res.locals.auditEvent.subjectType = 'PRISONER_ID'
    res.locals.auditEvent.subjectId = prisoner.prisonerNumber

    const interviews = record.referral!.investigation?.interviews
    if (interviews) {
      investigation!.interviews = interviews.sort(interviewSorter)
    }

    const decision = record.referral!.decisionAndActions

    const screening = record.referral!.saferCustodyScreeningOutcome

    const splitUrl = req.url.split('/')
    const tabSelected = splitUrl[splitUrl.length - 1]!

    return {
      contributoryFactors: referral.contributoryFactors,
      record,
      prisoner,
      decision,
      screening,
      investigation,
      referral,
      recordUuid,
      tabSelected,
    }
  }

  GET_BASE = async (req: Request, res: Response) => {
    const { recordUuid } = req.params
    const record = await this.csipApiService.getCsipRecord(req, recordUuid!)

    let tabSelected = 'referral'
    if (record.plan) {
      tabSelected = 'plan'
    } else if (record.referral.investigation) {
      tabSelected = 'investigation'
    }

    res.redirect(`/csip-records/${recordUuid}/${tabSelected}`)
  }

  GET = async (req: Request, res: Response) => {
    if (req.journeyData) {
      req.journeyData.isUpdate = false
    }
    const {
      record,
      prisoner,
      decision,
      screening,
      investigation,
      referral,
      recordUuid,
      tabSelected,
      contributoryFactors,
    } = await this.getRecordInfo(req, res)

    let actionButton
    let secondaryButton
    switch (record.status.code) {
      case 'REFERRAL_PENDING':
        if (!referral.isReferralComplete) {
          actionButton = {
            label: 'Complete referral',
            action: 'complete-referral',
          }
        } else {
          secondaryButton = {
            label: 'Update referral',
            link: `/csip-record/${recordUuid}/update-referral/start`,
          }
        }
        break
      case 'REFERRAL_SUBMITTED':
        actionButton = {
          label: 'Screen referral',
          action: 'screen',
        }
        secondaryButton = {
          label: 'Update referral',
          link: `/csip-record/${recordUuid}/update-referral/start`,
        }
        break
      case 'PLAN_PENDING':
        actionButton = {
          label: 'Develop initial plan',
          action: 'plan',
        }
        if (decision) {
          secondaryButton = {
            label: 'Update decision',
            link: `/csip-record/${recordUuid}/update-decision/start`,
          }
        } else if (investigation) {
          secondaryButton = {
            label: 'Update investigation',
            link: `/csip-record/${recordUuid}/update-investigation/start`,
          }
        }
        break
      case 'SUPPORT_OUTSIDE_CSIP':
      case 'ACCT_SUPPORT':
      case 'NO_FURTHER_ACTION':
        if (decision) {
          secondaryButton = {
            label: 'Update decision',
            link: `/csip-record/${recordUuid}/update-decision/start`,
          }
        }
        break
      case 'INVESTIGATION_PENDING':
        actionButton = {
          label: 'Record investigation',
          action: 'investigation',
        }
        break
      case 'AWAITING_DECISION':
        actionButton = {
          label: 'Record decision',
          action: 'decision',
        }
        secondaryButton = {
          label: 'Update investigation',
          link: `/csip-record/${recordUuid}/update-investigation/start`,
        }
        break
      case 'CSIP_OPEN':
        actionButton = {
          label: 'Record CSIP review',
          action: 'review',
        }
        secondaryButton = {
          label: 'Update plan',
          link: `/csip-record/${recordUuid}/update-plan/start`,
        }
        break
      case 'CSIP_CLOSED':
      case 'UNKNOWN':
      default:
        break
    }

    res.render('csip-records/view', {
      status: record.status.code,
      updatingEntity: record.plan ? null : 'referral',
      shouldShowTabs: !!investigation || !!record.plan || record.status.code === 'PLAN_PENDING',
      changeScreenEnabled: shouldAllowChangeScreen(record, res),
      plan: record.plan,
      identifiedNeeds: record.plan?.identifiedNeeds.sort(identifiedNeedSorter),
      reviews: record.plan?.reviews
        ?.sort((a, b) => a.reviewSequence - b.reviewSequence)
        ?.map(review => ({
          ...review,
          attendees: review.attendees?.sort(attendeeSorter) || [],
        })),
      record,
      decision,
      investigation,
      recordUuid,
      tabSelected,
      actionButton,
      prisoner,
      referral,
      screening,
      contributoryFactors,
      showBreadcrumbs: true,
      secondaryButton,
      successMessage: req.flash(FLASH_KEY__CSIP_SUCCESS_MESSAGE)[0],
      isCsipProcessor: isCsipProcessor(res),
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
        res.redirect(`/csip-record/${recordUuid}/record-review/start`)
        break
      case 'complete-referral':
        res.redirect(`/csip-record/${recordUuid}/referral/start`)
        break
      default:
        res.redirect(req.get('Referrer') || '/')
    }
  }
}
