import { NextReviewDateController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import { schema } from './schemas'
import { JourneyRouter } from '../../base/routes'

export const NextReviewDateRoutes = () => {
  const { router, get, post } = JourneyRouter()
  const controller = new NextReviewDateController()

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
