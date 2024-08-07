import { ReferralReasonsController } from './controller'
import { validate } from '../../../middleware/validationMiddleware'
import { schemaFactory } from './schemas'
import { JourneyRouter } from '../../base/routes'

export const ReferralReasonsRoutes = () => {
  const { router, get, post } = JourneyRouter()
  const controller = new ReferralReasonsController()

  get('/', controller.GET)
  post('/', validate(schemaFactory), controller.POST)

  return router
}
