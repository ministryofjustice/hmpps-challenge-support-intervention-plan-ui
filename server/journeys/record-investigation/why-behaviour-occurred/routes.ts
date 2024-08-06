import { OccurrenceReasonController } from './controller'
import { validate } from '../../../middleware/validationMiddleware'
import { schema } from './schemas'
import { JourneyRouter } from '../../base/routes'

export const OccurrenceReasonRoutes = () => {
  const { router, get, post } = JourneyRouter()
  const controller = new OccurrenceReasonController()

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
