import { UpdateOutcomeController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import { schema } from '../../record-review/outcome/schemas'
import { JourneyRouter } from '../../base/routes'

export const UpdateOutcomeRoutes = () => {
  const { router, get, post } = JourneyRouter()
  const controller = new UpdateOutcomeController()

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
