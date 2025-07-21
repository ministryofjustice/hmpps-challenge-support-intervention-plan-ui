import { Request, Response } from 'express'
import { setPaginationLocals } from '../../views/partials/simplePagination/utils'
import { BaseJourneyController } from '../journeys/base/controller'

const PAGE_SIZE = 25

export class PrisonerCsipsController extends BaseJourneyController {
  GET = async (req: Request, res: Response) => {
    const filterParams = {
      query: req.params['prisonNumber']!,
      sort: getSortParam(req),
      page: Number(req.query['page']) || 1,
    }

    const { content: records, metadata } = await this.csipApiService.searchAndSortCsipRecords(req, {
      sort: filterParams.sort || 'referralDate,asc',
      query: filterParams.query,
      page: filterParams.page,
      size: PAGE_SIZE,
    })

    const paginationQueryParams = new URLSearchParams({
      sort: filterParams.sort || 'referralDate,asc',
      query: filterParams.query,
    })
    const sortQueryParams = new URLSearchParams({ query: filterParams.query })

    setPaginationLocals(
      res,
      PAGE_SIZE,
      filterParams.page,
      metadata.totalElements,
      records.length,
      `?${paginationQueryParams.toString()}&page={page}`,
    )

    return res.render('prisoner-csips/view', {
      prisoner: req.middleware!.prisonerData!,
      showBreadcrumbs: true,
      records,
      ...filterParams,
      hrefTemplate: `?${sortQueryParams.toString()}&sort={sort}`,
    })
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
