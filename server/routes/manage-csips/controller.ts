import { Request, Response } from 'express'
import { setPaginationLocals } from '../../views/partials/simplePagination/utils'
import { getNonUndefinedProp } from '../../utils/utils'
import { CsipRecordStatus, ReferenceData } from '../../@types/csip/csipApiTypes'
import { BaseJourneyController } from '../journeys/base/controller'

const PAGE_SIZE = 25

const VALID_REFERRAL_STATUSES: CsipRecordStatus[] = [
  'AWAITING_DECISION',
  'PLAN_PENDING',
  'INVESTIGATION_PENDING',
  'REFERRAL_SUBMITTED',
  'REFERRAL_PENDING',
]
const VALID_PLAN_STATUSES: CsipRecordStatus[] = ['CSIP_OPEN', 'CSIP_CLOSED']
const VALID_OTHER_STATUSES: CsipRecordStatus[] = ['NO_FURTHER_ACTION', 'SUPPORT_OUTSIDE_CSIP']

export class SearchCsipController extends BaseJourneyController {
  GET = async (req: Request, res: Response) => {
    if (res.locals.validationErrors) {
      // if the API call failed (and resulted in a validation error message), render empty result instead of repeating the API call again
      return res.render('manage-csips/view', {
        showBreadcrumbs: true,
        records: [],
        pageName: req.originalUrl.split('?')[0]!.replace('/manage-', ''),
      })
    }

    const validStatuses = await this.csipApiService.getReferenceData(req, 'status')

    if (req.query['clear']) {
      return res.redirect(req.originalUrl.split('?')[0]!)
    }

    const filterParams = {
      sort: getSortParam(req),
      page: Number(req.query['page']) || 1,
      query: req.query['query'] ? (req.query['query'] as string).trim() : '',
      status: (req.query['status'] as string) || '',
    }

    const { content: records, metadata } = await this.csipApiService.searchAndSortCsipRecords(req, {
      prisonCode: res.locals.user.activeCaseLoad!.caseLoadId,
      sort: filterParams.sort || 'name,asc',
      ...getNonUndefinedProp(filterParams, 'query'),
      status: getStatusFilter(req),
      page: filterParams.page,
      size: PAGE_SIZE,
    })

    const paginationQueryParams = new URLSearchParams({
      sort: filterParams.sort || 'name,asc',
      query: filterParams.query,
      status: filterParams.status,
    })
    const sortQueryParams = new URLSearchParams({ query: filterParams.query, status: filterParams.status })

    setPaginationLocals(
      res,
      PAGE_SIZE,
      filterParams.page,
      metadata.totalElements,
      records.length,
      `?${paginationQueryParams.toString()}&page={page}`,
    )

    return res.render('manage-csips/view', {
      showBreadcrumbs: true,
      pageName: req.originalUrl.split('?')[0]!.replace('/manage-', ''),
      records,
      statuses: getAvailableStatuses(req, validStatuses),
      ...filterParams,
      hrefTemplate: `?${sortQueryParams.toString()}&sort={sort}`,
    })
  }

  POST = async (req: Request, res: Response) => {
    const queryParams = new URLSearchParams({ query: req.body.query, status: req.body.status, page: '1', sort: '' })

    res.redirect(`${req.originalUrl.split('?')[0]!}?${queryParams.toString()}`)
  }
}

function getSortParam(req: Request) {
  const [sortingKey, sortingDirection] = ((req.query['sort'] as string) || '').split(',')

  if (!sortingKey || !sortingDirection) {
    return ''
  }

  const keys = [
    'name',
    'location',
    'referralDate',
    'logCode',
    'caseManager',
    'nextReviewDate',
    'incidentType',
    'status',
  ]
  const directions = ['asc', 'desc']

  if (!keys.includes(sortingKey) || !directions.includes(sortingDirection)) {
    return ''
  }

  return req.query['sort'] as string
}

function getAvailableStatuses(req: Request, allStatuses: ReferenceData[]) {
  const get = (arr: CsipRecordStatus[]) =>
    allStatuses.filter(o => arr.includes(o.code as CsipRecordStatus)).map(o => ({ text: o.description, value: o.code }))

  if (req.originalUrl.includes('manage-plans')) {
    return [{ text: 'All open and closed CSIPs', value: '' }, ...get(VALID_PLAN_STATUSES)]
  }

  if (req.originalUrl.includes('manage-referrals')) {
    return [{ text: 'All referrals in progress', value: '' }, ...get(VALID_REFERRAL_STATUSES)]
  }

  return [
    { text: 'All', value: '' },
    ...get([...VALID_OTHER_STATUSES, ...VALID_PLAN_STATUSES, ...VALID_REFERRAL_STATUSES]),
  ]
}

function getStatusFilter(req: Request): CsipRecordStatus[] | null {
  const status = req.query['status'] as CsipRecordStatus

  if (req.originalUrl.includes('manage-csips')) {
    return statusGuard(status, [...VALID_OTHER_STATUSES, ...VALID_PLAN_STATUSES, ...VALID_REFERRAL_STATUSES])
  }

  if (req.originalUrl.includes('manage-plans')) {
    return statusGuard(status, VALID_PLAN_STATUSES)
  }

  if (req.originalUrl.includes('manage-referrals')) {
    return statusGuard(status, VALID_REFERRAL_STATUSES)
  }

  return null
}

function statusGuard(status: CsipRecordStatus, validStatuses: CsipRecordStatus[]) {
  if (validStatuses.includes(status)) {
    return [status]
  }

  return validStatuses
}
