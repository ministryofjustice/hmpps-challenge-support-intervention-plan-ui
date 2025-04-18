import { OutcomeController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import { schema } from './schemas'
import { JourneyRouter } from '../../base/routes'

export const OutcomeRoutes = () => {
  const { router, get, post } = JourneyRouter()
  const controller = new OutcomeController()

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
