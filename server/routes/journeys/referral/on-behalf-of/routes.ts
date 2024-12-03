import { ReferralOnBehalfOfController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import { schema } from './schemas'
import { JourneyRouter } from '../../base/routes'
import CsipApiService from '../../../../services/csipApi/csipApiService'

export const OnBehalfOfRoutes = (csipApiService: CsipApiService) => {
  const { router, get, post } = JourneyRouter()
  const referralOnBehalfOfController = new ReferralOnBehalfOfController(csipApiService)

  get('/', referralOnBehalfOfController.GET)
  post('/', validate(schema), referralOnBehalfOfController.POST)

  return router
}
