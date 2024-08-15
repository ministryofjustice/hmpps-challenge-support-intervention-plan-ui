import { UsualBehaviourPresentationController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import { schema } from './schemas'
import { JourneyRouter } from '../../base/routes'

export const UsualBehaviourPresentationRoutes = () => {
  const { router, get, post } = JourneyRouter()
  const controller = new UsualBehaviourPresentationController()

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
