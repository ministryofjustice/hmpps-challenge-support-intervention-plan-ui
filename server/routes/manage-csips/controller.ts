import { Request, Response } from 'express'
import CsipApiService from '../../services/csipApi/csipApiService'
import PrisonApiService from '../../services/prisonApi/prisonApiService'
import { setPaginationLocals } from '../../views/partials/simplePagination/utils'
import { getNonUndefinedProp } from '../../utils/utils'

const PAGE_SIZE = 25

export class SearchCsipController {
  constructor(
    private readonly csipApiService: CsipApiService,
    private readonly prisonApiService: PrisonApiService,
  ) {}

  GET = async (req: Request, res: Response) => {
    const { page, clear, sort } = req.query

    if (clear) {
      req.session.searchCsipParams = {}
      return res.redirect('manage-csips')
    }

    req.session.searchCsipParams ??= {}
    if (sort) {
      const [sortingKey, sortingDirection] = (sort as string).split(',')
      if (
        ['name', 'location', 'referralDate', 'caseManager', 'nextReviewDate', 'status'].includes(sortingKey ?? '') &&
        ['asc', 'desc'].includes(sortingDirection ?? '')
      ) {
        req.session.searchCsipParams.sort = sort as string
      }

      return res.redirect('manage-csips')
    }

    const currentPage = Number.isNaN(Number(page)) ? 1 : Number(page)

    const prisonCode = (await this.prisonApiService.getCaseLoads(req)).find(
      caseLoad => caseLoad.currentlyActive,
    )!.caseLoadId

    const { content: records, metadata } = await this.csipApiService.searchAndSortCsipRecords({
      req,
      prisonCode,
      sort: req.session.searchCsipParams.sort || 'name,asc',
      ...getNonUndefinedProp(req.session.searchCsipParams, 'query'),
      ...getNonUndefinedProp(req.session.searchCsipParams, 'status'),
      page: currentPage,
      size: PAGE_SIZE,
    })
    setPaginationLocals(res, PAGE_SIZE, currentPage, metadata.totalElements, records.length)

    return res.render('manage-csips/view', {
      showBreadcrumbs: true,
      records,
      ...req.session.searchCsipParams,
    })
  }

  POST = async (req: Request, res: Response) => {
    req.session.searchCsipParams ??= {}
    req.session.searchCsipParams.query = (req.body.query as string).trim() || null
    req.session.searchCsipParams.status = req.body.status || null
    delete req.session.searchCsipParams.sort
    res.redirect('manage-csips')
  }
}
