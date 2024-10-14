import { SummaryController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import { schemaFactory } from './schemas'
import { JourneyRouter } from '../../base/routes'

export const SummaryRoutes = () => {
  const { router, get, post } = JourneyRouter()
  const controller = new SummaryController()

  get('/', controller.GET)
  post('/', validate(schemaFactory), controller.POST)

  return router
}
