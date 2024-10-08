import { NewInterventionDetailsController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import { schema } from '../../develop-an-initial-plan/intervention-details/schemas'
import { JourneyRouter } from '../../base/routes'

export const NewInterventionDetailsRoutes = () => {
  const { router, get, post } = JourneyRouter()
  const controller = new NewInterventionDetailsController()

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
