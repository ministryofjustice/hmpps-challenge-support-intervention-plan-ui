import { UpdateIdentifiedNeedController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import { schema } from '../../develop-an-initial-plan/summarise-identified-need/schemas'
import type CsipApiService from '../../../../services/csipApi/csipApiService'
import { JourneyRouter } from '../../base/routes'

export const UpdateIdentifiedNeedRoutes = (csipApiService: CsipApiService) => {
  const { router, get, post } = JourneyRouter()
  const controller = new UpdateIdentifiedNeedController(csipApiService)

  get('/', controller.GET)
  post('/', validate(schema), controller.checkSubmitToAPI, controller.POST)

  return router
}
