import type { Services } from '../../services'
import { JourneyRouter } from '../journeys/base/routes'
import { SearchCsipController } from './controller'

export const SearchCsipRoutes = ({ csipApiService, prisonApiService }: Services) => {
  const { router, get, post } = JourneyRouter()
  const controller = new SearchCsipController(csipApiService, prisonApiService)

  get('/', controller.GET)
  post('/', controller.POST)

  return router
}
