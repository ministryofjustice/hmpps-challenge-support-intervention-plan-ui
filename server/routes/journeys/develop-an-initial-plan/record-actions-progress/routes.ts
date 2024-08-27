import { RecordActionsProgressController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import { schema } from './schemas'
import { JourneyRouter } from '../../base/routes'

export const RecordActionsProgressRoutes = () => {
  const { router, get, post } = JourneyRouter()
  const controller = new RecordActionsProgressController()

  get('/:index', controller.GET)
  post('/:index', validate(schema), controller.POST)

  return router
}
