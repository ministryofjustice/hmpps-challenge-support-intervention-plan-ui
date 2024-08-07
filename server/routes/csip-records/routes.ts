import { CsipRecordController } from './controller'
import CsipApiService from '../../services/csipApi/csipApiService'
import PrisonerSearchService from '../../services/prisonerSearch/prisonerSearchService'
import { JourneyRouter } from '../../journeys/base/routes'

export const CsipRecordRoutes = (csipApiService: CsipApiService, prisonerSearchService: PrisonerSearchService) => {
  const { router, get, post } = JourneyRouter()
  const controller = new CsipRecordController(csipApiService, prisonerSearchService)

  get('/', controller.GET)
  post('/', controller.POST)

  return router
}
