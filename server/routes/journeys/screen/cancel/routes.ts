import { CancelController } from './controller'
import { JourneyRouter } from '../../base/routes'

export const CancelRoutes = () => {
  const { router, get } = JourneyRouter()
  const controller = new CancelController()

  get('/', controller.GET)

  return router
}
