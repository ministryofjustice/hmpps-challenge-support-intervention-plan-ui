import { UpdateReferralDetailsController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import { schemaFactory } from '../../referral/details/schemas'
import type CsipApiService from '../../../../services/csipApi/csipApiService'
import { JourneyRouter } from '../../base/routes'

export const UpdateReferralDetailsRoutes = (csipApiService: CsipApiService) => {
  const { router, get, post } = JourneyRouter()
  const controller = new UpdateReferralDetailsController(csipApiService)

  get('/', controller.GET)
  post('/', validate(schemaFactory(csipApiService)), controller.checkSubmitToAPI, controller.POST)

  return router
}
