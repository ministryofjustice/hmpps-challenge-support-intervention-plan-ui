import { NextStepsController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import { JourneyRouter } from '../../base/routes'
import { schemaFactory } from '../../record-decision/next-steps/schemas'

export const NextStepsRoutes = () => {
  const { router, get, post } = JourneyRouter()
  const controller = new NextStepsController()

  get('/', controller.GET)
  post(
    '/',
    validate((req, res) => schemaFactory(req, res, true)),
    controller.POST,
  )

  return router
}
