import { ReferralDetailsController } from './controller'
import { validate } from '../../../middleware/validationMiddleware'
import { schemaFactory } from './schemas'
import CsipApiService from '../../../services/csipApi/csipApiService'
import { JourneyRouter } from '../../base/routes'

export const ReferralDetailsRoutes = (csipApiService: CsipApiService) => {
  const { router, get, post } = JourneyRouter()
  const controller = new ReferralDetailsController(csipApiService)

  get('/', controller.GET)
  post('/', validate(schemaFactory(csipApiService)), controller.POST)

  return router
}
