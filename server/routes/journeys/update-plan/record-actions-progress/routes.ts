import { NewActionsProgressionController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import { schema } from '../../develop-an-initial-plan/record-actions-progress/schemas'
import { JourneyRouter } from '../../base/routes'

export const NewActionsProgressionRoutes = () => {
  const { router, get, post } = JourneyRouter()
  const controller = new NewActionsProgressionController()

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
