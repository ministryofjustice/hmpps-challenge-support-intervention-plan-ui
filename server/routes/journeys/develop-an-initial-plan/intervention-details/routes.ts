import { InterventionDetailsController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import { schema } from './schemas'
import { JourneyRouter } from '../../base/routes'

export const InterventionDetailsRoutes = () => {
  const { router, get, post } = JourneyRouter()
  const controller = new InterventionDetailsController()

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
