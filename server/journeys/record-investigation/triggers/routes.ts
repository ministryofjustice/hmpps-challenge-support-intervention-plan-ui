import { TriggersController } from './controller'
import { validate } from '../../../middleware/validationMiddleware'
import { schema } from './schemas'
import { JourneyRouter } from '../../base/routes'

export const TriggersRoutes = () => {
  const { router, get, post } = JourneyRouter()

  const controller = new TriggersController()

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
