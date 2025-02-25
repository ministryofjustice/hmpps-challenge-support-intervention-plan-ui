import { JourneyRouter } from '../base/routes'
import { CheckController } from './controller'

export default function CheckRoutes() {
  const { router, get, post } = JourneyRouter()
  const controller = new CheckController()

  get('/', controller.GET)
  post('/', controller.POST)

  return router
}
