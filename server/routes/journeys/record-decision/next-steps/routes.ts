import { NextStepsController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import { schemaFactory } from './schemas'
import { JourneyRouter } from '../../base/routes'

export const NextStepsRoutes = () => {
  const { router, get, post } = JourneyRouter()
  const controller = new NextStepsController()

  get('/', controller.GET)
  post('/', validate(schemaFactory), controller.POST)

  return router
}
