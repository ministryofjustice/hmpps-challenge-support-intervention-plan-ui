import { IdentifiedNeedsController } from './controller'
import { JourneyRouter } from '../../base/routes'

export const IdentifiedNeedsRoutes = () => {
  const { router, get, post } = JourneyRouter()
  const controller = new IdentifiedNeedsController()

  get('/', controller.GET)
  post('/', controller.POST)

  return router
}
