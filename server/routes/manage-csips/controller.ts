import { Request, Response } from 'express'
import { setPaginationLocals } from '../../views/partials/simplePagination/utils'
import { getNonUndefinedProp } from '../../utils/utils'
import { CsipRecordStatus } from '../../@types/csip/csipApiTypes'
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
        ...req.session.searchCsipParams,
      })
    }

    const { page, clear, sort, query, status } = req.query

    if (clear) {
      req.session.searchCsipParams = {}
    }

    req.session.searchCsipParams ??= {}

    if (page || sort || query || status) {
      req.session.searchCsipParams.page = Number.isNaN(Number(page)) ? 1 : Number(page)

      if (query || status) {
        if (query) {
          req.session.searchCsipParams.query = (query as string).trim() || null
        } else {
          delete req.session.searchCsipParams.query
        }
        if (status) {
          req.session.searchCsipParams.status = status as CsipRecordStatus
        } else {
          delete req.session.searchCsipParams.status
        }
        delete req.session.searchCsipParams.sort
      }

      if (sort) {
        const [sortingKey, sortingDirection] = (sort as string).split(',')
        if (
          [
            'name',
            'location',
            'referralDate',
            'logCode',
            'caseManager',
            'nextReviewDate',
            'incidentType',
            'status',
          ].includes(sortingKey ?? '') &&
          ['asc', 'desc'].includes(sortingDirection ?? '')
        ) {
          req.session.searchCsipParams.sort = sort as string
        }
      }

      return res.redirect(req.originalUrl.split('?')[0]!)
    }

    const currentPage = req.session.searchCsipParams.page || 1

    const { content: records, metadata } = await this.csipApiService.searchAndSortCsipRecords(req, {
      prisonCode: res.locals.user.activeCaseLoad!.caseLoadId,
      sort: req.session.searchCsipParams.sort || 'name,asc',
      ...getNonUndefinedProp(req.session.searchCsipParams, 'query'),
      status: getStatusFilter(req),
      page: currentPage,
      size: PAGE_SIZE,
    })
    setPaginationLocals(res, PAGE_SIZE, currentPage, metadata.totalElements, records.length)

    return res.render('manage-csips/view', {
      showBreadcrumbs: true,
      pageName: req.originalUrl.split('?')[0]!.replace('/manage-', ''),
      records,
      ...req.session.searchCsipParams,
    })
  }

  POST = async (req: Request, res: Response) => {
    req.session.searchCsipParams ??= {}
    req.session.searchCsipParams.query = req.body.query as string
    req.session.searchCsipParams.status = req.body.status || null
    req.session.searchCsipParams.page = 1
    delete req.session.searchCsipParams.sort
    res.redirect(req.originalUrl.split('?')[0]!)
  }
}

function getStatusFilter(req: Request): CsipRecordStatus[] | null {
  const status = req.body.status || req.session.searchCsipParams?.status

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
