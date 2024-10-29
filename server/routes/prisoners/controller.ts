import { Request, Response } from 'express'
import CsipApiService from '../../services/csipApi/csipApiService'
import PrisonerSearchService from '../../services/prisonerSearch/prisonerSearchService'
import { setPaginationLocals } from '../../views/partials/simplePagination/utils'

const PAGE_SIZE = 10

export class PrisonersController {
  constructor(
    private readonly csipApiService: CsipApiService,
    private readonly prisonerSearchService: PrisonerSearchService,
  ) {}

  GET = async (req: Request, res: Response) => {
    const { prisonNumber } = req.params
    const { page } = req.query

    const currentPage = Number.isNaN(Number(page)) ? 1 : Number(page)

    const prisoner = await this.prisonerSearchService.getPrisonerDetails(req, prisonNumber!)
    const csipSummaries = await this.csipApiService.getPrisonerCsipRecords(req, prisonNumber!, currentPage, PAGE_SIZE)
    setPaginationLocals(res, PAGE_SIZE, currentPage, csipSummaries.metadata.totalElements, csipSummaries.content.length)

    res.render('prisoners/view', {
      prisoner,
      csipRecords: csipSummaries.content,
      showBreadcrumbs: true,
    })
  }
}
