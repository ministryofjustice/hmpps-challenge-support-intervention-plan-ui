import { ReferralSaferCustodyController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import { schema } from './schemas'
import { JourneyRouter } from '../../base/routes'

export const ReferralSaferCustodyRoutes = () => {
  const { router, get, post } = JourneyRouter()
  const controller = new ReferralSaferCustodyController()

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
