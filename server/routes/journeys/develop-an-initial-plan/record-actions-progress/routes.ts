import { RecordActionsProgressController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import { schemaFactory } from './schemas'
import { JourneyRouter } from '../../base/routes'

export const RecordActionsProgressRoutes = () => {
  const { router, get, post } = JourneyRouter()
  const controller = new RecordActionsProgressController()

  get('/', controller.GET)
  post('/', validate(schemaFactory), controller.POST)

  return router
}
