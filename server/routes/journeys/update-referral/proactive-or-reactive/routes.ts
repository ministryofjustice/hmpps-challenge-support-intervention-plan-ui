import { UpdateProactiveOrReactiveController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import { schema } from '../../referral/proactive-or-reactive/schemas'
import type CsipApiService from '../../../../services/csipApi/csipApiService'
import { JourneyRouter } from '../../base/routes'

export const UpdateProactiveOrReactiveRoutes = (csipApiService: CsipApiService) => {
  const { router, get, post } = JourneyRouter()
  const controller = new UpdateProactiveOrReactiveController(csipApiService)

  get('/', controller.GET)
  post('/', validate(schema), controller.checkSubmitToAPI, controller.POST)

  return router
}
