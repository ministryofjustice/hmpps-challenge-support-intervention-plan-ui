import { ReferralOnBehalfOfController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import { schema } from './schemas'
import { JourneyRouter } from '../../base/routes'

export const OnBehalfOfRoutes = () => {
  const { router, get, post } = JourneyRouter()
  const referralOnBehalfOfController = new ReferralOnBehalfOfController()

  get('/', referralOnBehalfOfController.GET)
  post('/', validate(schema), referralOnBehalfOfController.POST)

  return router
}
