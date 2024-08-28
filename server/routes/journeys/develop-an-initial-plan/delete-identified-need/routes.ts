import { DeleteIdentifiedNeedController } from './controller'
import { JourneyRouter } from '../../base/routes'

export const DeleteIdentifiedNeedRoutes = () => {
  const { router, get, post } = JourneyRouter()
  const controller = new DeleteIdentifiedNeedController()

  get('/', controller.GET)
  post('/', controller.POST)

  return router
}
