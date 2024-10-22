import { SummaryController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import { schema } from './schemas'
import { JourneyRouter } from '../../base/routes'

export const SummaryRoutes = () => {
  const { router, get, post } = JourneyRouter()
  const controller = new SummaryController()

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
