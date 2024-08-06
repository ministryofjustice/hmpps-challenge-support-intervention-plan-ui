import { ReferralAdditionalInformationController } from './controller'
import { validate } from '../../../middleware/validationMiddleware'
import { schema } from './schemas'
import { JourneyRouter } from '../../base/routes'

export const ReferralAdditionalInformationRoutes = () => {
  const { router, get, post } = JourneyRouter()
  const controller = new ReferralAdditionalInformationController()

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
