import { SummariseIdentifiedNeedController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import { schema } from './schemas'
import { JourneyRouter } from '../../base/routes'

export const SummariseIdentifiedNeedRoutes = () => {
  const { router, get, post } = JourneyRouter()
  const controller = new SummariseIdentifiedNeedController()

  get('/:index', controller.GET)
  post('/:index', validate(schema), controller.POST)

  return router
}
