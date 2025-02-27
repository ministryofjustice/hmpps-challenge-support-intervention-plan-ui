import { validate } from '../../../../middleware/validationMiddleware'
import { JourneyRouter } from '../../base/routes'
import { schemaFactory } from '../../record-decision/additional-information/schemas'
import { AdditionalInformationController } from './controller'

export const AdditionalInformationRoutes = () => {
  const { router, get, post } = JourneyRouter()
  const controller = new AdditionalInformationController()

  get('/', controller.GET)
  post(
    '/',
    validate((req, res) => schemaFactory(req, res, true)),
    controller.POST,
  )

  return router
}
