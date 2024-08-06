import { ReferralDescriptionController } from './controller'
import { validate } from '../../../middleware/validationMiddleware'
import { schemaFactory } from './schemas'
import { JourneyRouter } from '../../base/routes'

export const ReferralDescriptionRoutes = () => {
  const { router, get, post } = JourneyRouter()
  const controller = new ReferralDescriptionController()

  get('/', controller.GET)
  post('/', validate(schemaFactory), controller.POST)

  return router
}
