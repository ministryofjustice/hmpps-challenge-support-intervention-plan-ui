import { UpdateSaferCustodyController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import { schema } from '../../referral/safer-custody/schemas'
import type CsipApiService from '../../../../services/csipApi/csipApiService'
import { JourneyRouter } from '../../base/routes'

export const UpdateSaferCustodyRoutes = (csipApiService: CsipApiService) => {
  const { router, get, post } = JourneyRouter()
  const controller = new UpdateSaferCustodyController(csipApiService)

  get('/', controller.GET)
  post('/', validate(schema), controller.checkSubmitToAPI, controller.POST)

  return router
}
