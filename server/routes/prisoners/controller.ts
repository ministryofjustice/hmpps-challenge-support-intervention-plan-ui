import { Request, Response } from 'express'
import CsipApiService from '../../services/csipApi/csipApiService'
import PrisonerSearchService from '../../services/prisonerSearch/prisonerSearchService'

const PAGE_SIZE = 10

export class PrisonersController {
  constructor(
    private readonly csipApiService: CsipApiService,
    private readonly prisonerSearchService: PrisonerSearchService,
  ) {}

  GET = async (req: Request, res: Response) => {
    const { prisonNumber } = req.params
    const { page } = req.query

    const pageNumber = Number.isNaN(Number(page)) ? 1 : Number(page)

    const prisoner = await this.prisonerSearchService.getPrisonerDetails(req, prisonNumber!)
    const csipSummaries = await this.csipApiService.getPrisonerCsipRecords(req, prisonNumber!, pageNumber, PAGE_SIZE)

    const pageCount = Math.ceil(csipSummaries.metadata.totalElements / PAGE_SIZE)

    res.render('prisoners/view', {
      prisoner,
      csipRecords: csipSummaries.content,
      pagination:
        pageCount > 1
          ? {
              previous:
                pageNumber > 1
                  ? {
                      href: `?page=${pageNumber - 1}`,
                    }
                  : undefined,
              next:
                pageCount > pageNumber
                  ? {
                      href: `?page=${pageNumber + 1}`,
                    }
                  : undefined,
              items: [...Array(pageCount).keys()]
                .map(i => i + 1)
                .map(index => ({
                  number: index,
                  current: index === pageNumber,
                  href: `?page=${index}`,
                })),
            }
          : undefined,
      showBreadcrumbs: true,
    })
  }
}
