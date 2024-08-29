import { SummariseIdentifiedNeedController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import { schema } from './schemas'
import { JourneyRouter } from '../../base/routes'

export const SummariseIdentifiedNeedRoutes = () => {
  const { router, get, post } = JourneyRouter()
  const controller = new SummariseIdentifiedNeedController()

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
