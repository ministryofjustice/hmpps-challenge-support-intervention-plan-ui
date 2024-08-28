import { PrisonersController } from './controller'
import { JourneyRouter } from '../journeys/base/routes'
import type { Services } from '../../services'

export const PrisonerRoutes = ({ csipApiService, prisonerSearchService }: Services) => {
  const { router, get } = JourneyRouter()
  const controller = new PrisonersController(csipApiService, prisonerSearchService)

  get('/', controller.GET)

  return router
}
