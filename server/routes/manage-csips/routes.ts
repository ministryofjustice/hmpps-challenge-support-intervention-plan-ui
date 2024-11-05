import type { Services } from '../../services'
import { JourneyRouter } from '../journeys/base/routes'
import { SearchCsipController } from './controller'

export const SearchCsipRoutes = ({ csipApiService }: Services) => {
  const { router, get, post } = JourneyRouter()
  const controller = new SearchCsipController(csipApiService)

  get('/', controller.GET)
  post('/', controller.POST)

  return router
}
