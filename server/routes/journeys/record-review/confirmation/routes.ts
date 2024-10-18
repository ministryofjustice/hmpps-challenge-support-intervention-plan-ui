import { ConfirmationController } from './controller'
import { JourneyRouter } from '../../base/routes'

export const ConfirmationRoutes = () => {
  const { router, get } = JourneyRouter()
  const controller = new ConfirmationController()

  get('/', controller.GET)

  return router
}
