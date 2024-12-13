import { request, Request, Response } from 'express'
import { components } from '../../../@types/csip'
import type PrisonerSearchService from '../../../services/prisonerSearch/prisonerSearchService'
import { BaseJourneyController } from '../base/controller'
import CsipApiService from '../../../services/csipApi/csipApiService'
import { ordinalNumber, sentenceCase, getNonUndefinedProp } from '../../../utils/utils'

type APIContributoryFactor = components['schemas']['ContributoryFactor']

const convertCfsToSummaryRows = (
  record: typeof request.journeyData.csipRecord,
  cfOptions: Awaited<ReturnType<BaseJourneyController['getReferenceDataOptionsForCheckboxes']>>,
) => {
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
            (a.comment && b.comment && a.comment.localeCompare(b.comment)) || a.factorUuid.localeCompare(b.factorUuid)
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
            changeLink: getChangeLink(record!.referral, cfOptions, cf),
          }
        })
    })
    .flat()
    .filter(cf => cf !== undefined)
}

const getChangeLink = (
  referral: components['schemas']['Referral'],
  cfOptions: Awaited<ReturnType<BaseJourneyController['getReferenceDataOptionsForCheckboxes']>>,
  cf: APIContributoryFactor,
) => {
  // Remove existing factors that are not the current one
  const availableFactors = cfOptions.filter(
    o =>
      cf.factorType.code === o.value ||
      !referral.contributoryFactors.find(factor => factor.factorType.code === o.value),
  )
  const cfIndex = availableFactors.findIndex(opt => opt.value === cf.factorType.code)
  const radioId = cfIndex < 1 ? '' : `-${cfIndex + 1}`
  return `update-referral/${cf.factorUuid}-type#contributoryFactor${radioId}`
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
    if (!['REFERRAL_SUBMITTED', 'REFERRAL_PENDING'].includes(record.status.code)) {
      return res.redirect(`/csip-records/${record.recordUuid}`)
    }

    const prisoner = await this.prisonerSearchService.getPrisonerDetails(req, record.prisonNumber)
    const { referral } = record

    req.journeyData.referral = {
      referredBy: referral.referredBy,
      refererArea: referral.refererArea,
      isProactiveReferral: Boolean(referral.isProactiveReferral),
      incidentLocation: referral.incidentLocation,
      incidentType: referral.incidentType,
      incidentDate: referral.incidentDate,
      incidentTime: referral.incidentTime ?? null,
      ...getNonUndefinedProp(referral, 'descriptionOfConcern'),
      ...getNonUndefinedProp(referral, 'knownReasons'),
      contributoryFactors: referral.contributoryFactors,
      isSaferCustodyTeamInformed: referral.isSaferCustodyTeamInformed,
      ...getNonUndefinedProp(referral, 'otherInformation'),
      ...getNonUndefinedProp(referral, 'incidentInvolvement'),
      isStaffAssaulted: Boolean(referral.isStaffAssaulted),
      ...getNonUndefinedProp(referral, 'assaultedStaffName'),
    }
    req.journeyData.isUpdate = true

    const contributoryFactorOptions = await this.getReferenceDataOptionsForCheckboxes(req, 'contributory-factor-type')
    const uniqueContributoryFactors = new Set(contributoryFactorOptions.map(cf => cf.value))
    const uniqueSelectedContributoryFactors = new Set(referral.contributoryFactors.map(cf => cf.factorType.code))
    const canAddMoreContributoryFactors = uniqueSelectedContributoryFactors.size < uniqueContributoryFactors.size

    const involvementFilter = (itm: { key: { text: string } }) =>
      referral.assaultedStaffName || itm.key.text !== 'Names of staff assaulted'

    const secondaryButton = {
      label: 'Cancel',
      link: `/csip-records/${record.recordUuid}`,
    }

    return res.render('csip-records/view', {
      tabSelected: 'referral',
      contributoryFactors: convertCfsToSummaryRows(record, contributoryFactorOptions),
      canAddMoreContributoryFactors,
      isUpdate: true,
      updatingEntity: 'referral',
      status: record.status.code,
      recordUuid: record.recordUuid,
      referralTabSelected: true,
      prisoner,
      referral,
      involvementFilter,
      showBreadcrumbs: true,
      secondaryButton,
      username: res.locals.user.displayName,
    })
  }
}
