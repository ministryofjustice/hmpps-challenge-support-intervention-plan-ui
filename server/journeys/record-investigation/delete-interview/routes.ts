import { DeleteInterviewController } from './controller'
import { JourneyRouter } from '../../base/routes'

export const DeleteInterviewRoutes = () => {
  const { router, get, post } = JourneyRouter()
  const controller = new DeleteInterviewController()

  get('/', controller.GET)
  post('/', controller.POST)

  return router
}
