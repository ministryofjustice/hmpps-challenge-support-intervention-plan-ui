import { ReferralProactiveOrReactiveController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import { schema } from './schemas'
import { JourneyRouter } from '../../base/routes'

export const ReferralProactiveOrReactiveRoutes = () => {
  const { router, get, post } = JourneyRouter()
  const controller = new ReferralProactiveOrReactiveController()

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
