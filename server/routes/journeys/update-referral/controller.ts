import { request, Request, Response } from 'express'
import { components } from '../../../@types/csip'
import type PrisonerSearchService from '../../../services/prisonerSearch/prisonerSearchService'
import { BaseJourneyController } from '../base/controller'
import CsipApiService from '../../../services/csipApi/csipApiService'
import { ordinalNumber, sentenceCase } from '../../../utils/utils'

const hasInvestigation = (status: components['schemas']['CsipRecord']['status']) => {
  return !(['REFERRAL_PENDING', 'REFERRAL_SUBMITTED', 'INVESTIGATION_PENDING'] as (typeof status)[]).includes(status)
}

type APIContributoryFactor = components['schemas']['ContributoryFactor']

const convertCfsToSummaryRows = (record: typeof request.journeyData.csipRecord) => {
  const groupedFactors = Object.groupBy(record!.referral.contributoryFactors, itm => itm.factorType.code) as Record<
    APIContributoryFactor['factorType']['code'],
    APIContributoryFactor[]
  > // Un-partial the result as there isn't a chance we would end up with undefined keys or values
  return Object.entries(groupedFactors)
    .sort(([_codeA, factorsA], [_codeB, factorsB]) =>
      (factorsA[0]!.factorType.description || factorsA[0]!.factorType.code).localeCompare(
        factorsB[0]!.factorType.description || factorsB[0]!.factorType.code,
      ),
    )
    .map(([_factorCode, cfList]) => {
      const filteredNoComments = cfList.filter(cf => cf.comment)
      const listToOperateOn = filteredNoComments.length > 0 ? filteredNoComments : [cfList[0]!]
      return listToOperateOn
        .sort((a, b) => {
          if (a.comment && (b.comment === undefined || b.comment === null)) {
            return 1
          }
          if ((a.comment === undefined || a.comment === null) && b.comment) {
            return -1
          }

          return (
            (a.comment && b.comment && a.comment.localeCompare(b.comment)) ||
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )
        })
        .map((cf, idx) => {
          const visuallyHiddenCommentText =
            listToOperateOn.length === 1
              ? `to the comment on ${sentenceCase(cf.factorType.description!, false)} factor`
              : `to the ${ordinalNumber(idx + 1)} comment on ${sentenceCase(cf.factorType.description!, false)} factor. This contributory factor is listed ${listToOperateOn.length} times in this referral.`
          return {
            ...cf,
            visuallyHiddenCommentText,
          }
        })
    })
    .flat()
    .filter(cf => cf !== undefined)
}

export class UpdateReferralController extends BaseJourneyController {
  constructor(
    override readonly csipApiService: CsipApiService,
    private readonly prisonerSearchService: PrisonerSearchService,
  ) {
    super(csipApiService)
  }

  UPDATE = async (req: Request, res: Response) => {
    const record = req.journeyData.csipRecord!

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

    const uniqueContributoryFactors = new Set(
      (await this.getReferenceDataOptionsForCheckboxes(req, 'contributory-factor-type')).map(cf => cf.value),
    )
    const uniqueSelectedContributoryFactors = new Set(referral.contributoryFactors.map(cf => cf.factorType.code))
    const canAddMoreContributoryFactors = uniqueSelectedContributoryFactors.size < uniqueContributoryFactors.size

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

    const involvementFilter = (itm: { key: { text: string } }) =>
      referral.assaultedStaffName || itm.key.text !== 'Names of staff assaulted'

    let secondaryButton
    switch (record.status) {
      case 'REFERRAL_PENDING':
        break
      case 'REFERRAL_SUBMITTED':
        secondaryButton = {
          label: 'Cancel',
          link: `/csip-record/${record.recordUuid}`,
        }
        break
      case 'PLAN_PENDING':
        break
      case 'INVESTIGATION_PENDING':
        break
      case 'SUPPORT_OUTSIDE_CSIP':
      case 'ACCT_SUPPORT':
      case 'NO_FURTHER_ACTION':
      case 'AWAITING_DECISION':
        break
      case 'CSIP_OPEN':
        break
      case 'CSIP_CLOSED':
      case 'UNKNOWN':
      default:
        break
    }

    req.journeyData.isUpdate = true

    res.render('csip-records/view', {
      contributoryFactors: convertCfsToSummaryRows(record),
      canAddMoreContributoryFactors,
      isUpdate: true,
      status: record.status,
      shouldShowTabs: hasInvestigation(record.status),
      decision: record.referral!.decisionAndActions,
      investigation,
      recordUuid: record.recordUuid,
      referralTabSelected: true,
      prisoner,
      referral,
      screening: record.referral!.saferCustodyScreeningOutcome,
      involvementFilter,
      showBreadcrumbs: true,
      secondaryButton,
    })
  }
}
