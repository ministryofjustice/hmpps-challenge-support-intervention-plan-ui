import { NewIdentifiedNeedController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import { schema } from '../../develop-an-initial-plan/summarise-identified-need/schemas'
import { JourneyRouter } from '../../base/routes'

export const NewIdentifiedNeedRoutes = () => {
  const { router, get, post } = JourneyRouter()
  const controller = new NewIdentifiedNeedController()

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
