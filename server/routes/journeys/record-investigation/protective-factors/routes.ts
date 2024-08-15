import { ProtectiveFactorsController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import { schema } from './schemas'
import { JourneyRouter } from '../../base/routes'

export const ProtectiveFactorsRoutes = () => {
  const { router, get, post } = JourneyRouter()
  const controller = new ProtectiveFactorsController()

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
