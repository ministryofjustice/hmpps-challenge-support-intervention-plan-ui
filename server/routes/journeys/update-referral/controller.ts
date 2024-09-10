import { Request, Response } from 'express'
import { components } from '../../../@types/csip'
import type PrisonerSearchService from '../../../services/prisonerSearch/prisonerSearchService'
import { BaseJourneyController } from '../base/controller'
import CsipApiService from '../../../services/csipApi/csipApiService'
import { ordinalNumber, sentenceCase } from '../../../utils/utils'

const hasInvestigation = (status: components['schemas']['CsipRecord']['status']) => {
  return !(['REFERRAL_PENDING', 'REFERRAL_SUBMITTED', 'INVESTIGATION_PENDING'] as (typeof status)[]).includes(status)
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

    const multipleCfs: Record<string, number> = {}
    referral.contributoryFactors.forEach(cf => {
      multipleCfs[cf.factorType.code] = multipleCfs[cf.factorType.code] ? multipleCfs[cf.factorType.code]! + 1 : 1
    })
    let previousCf = ''
    let cfCount = 0
    const contributoryFactors = referral.contributoryFactors
      .filter(cf => multipleCfs[cf.factorType.code] === 1 || cf.comment)
      .sort((cf1, cf2) => {
        const sortingField1 = cf1.factorType.description || cf1.factorType.code
        const sortingField2 = cf2.factorType.description || cf2.factorType.code
        if (sortingField1 > sortingField2) {
          return 1
        }
        if (sortingField1 < sortingField2) {
          return -1
        }
        // We're ok to assume comment exists here as there should be max 1 CF type with no comment, and therefore it should have been sorted by description/code
        if (cf1.comment! > cf2.comment!) {
          return 1
        }
        if (cf1.comment! < cf2.comment!) {
          return -1
        }
        return new Date(cf1.createdAt).getTime() - new Date(cf2.createdAt).getTime()
      })
      .map(cf => {
        if (previousCf === cf.factorType.code) {
          cfCount += 1
        } else {
          cfCount = 1
        }
        previousCf = cf.factorType.code

        const commentText =
          multipleCfs[cf.factorType.code] === 1
            ? `to the comment on ${sentenceCase(cf.factorType.description!, false)} factor`
            : `to the ${ordinalNumber(cfCount)} comment on ${sentenceCase(cf.factorType.description!, false)} factor. This contributory factor is listed ${multipleCfs[cf.factorType.code]} times in this referral.`

        return {
          card: {
            title: { text: cf.factorType.description },
          },
          rows: [
            {
              key: {
                text: 'Contributory factor',
              },
              value: {
                text: cf.factorType.description,
              },
              actions: {
                items: [
                  {
                    href: `update-referral/${cf.factorUuid}-factorType#factorType`,
                    text: 'Change',
                    visuallyHiddenText: `the contributory factor`,
                    classes: 'govuk-link--no-visited-state',
                  },
                ],
              },
            },
            {
              key: {
                text: 'Comment',
              },
              value: {
                text: cf.comment,
              },
              actions: {
                items: [
                  {
                    href: `update-referral/${cf.factorUuid}-comment#comment`,
                    text: 'Change',
                    visuallyHiddenText: commentText,
                    classes: 'govuk-link--no-visited-state',
                  },
                ],
              },
            },
          ],
        }
      })

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
      contributoryFactors,
      canAddMoreContributoryFactors,
      isUpdate: true,
      status: record.status,
      shouldShowTabs: hasInvestigation(record.status),
      decision,
      investigation,
      recordUuid: record.recordUuid,
      referralTabSelected: true,
      prisoner,
      referral,
      screening,
      involvementFilter,
      showBreadcrumbs: true,
      secondaryButton,
    })
  }
}
