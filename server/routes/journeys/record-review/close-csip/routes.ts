import { CloseCsipController } from './controller'
import { JourneyRouter } from '../../base/routes'

export const CloseCsipRoutes = () => {
  const { router, get, post } = JourneyRouter()
  const controller = new CloseCsipController()

  get('/', controller.GET)
  post('/', controller.POST)

  return router
}
