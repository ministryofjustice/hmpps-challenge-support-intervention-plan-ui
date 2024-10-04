import { UpdateInterventionDetailsController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import { schema } from './schemas'
import { JourneyRouter } from '../../base/routes'
import CsipApiService from '../../../../services/csipApi/csipApiService'

export const UpdateInterventionDetailsRoutes = (csipApiService: CsipApiService) => {
  const { router, get, post } = JourneyRouter()
  const controller = new UpdateInterventionDetailsController(csipApiService)

  get('/', controller.GET)
  post('/', validate(schema), controller.checkSubmitToAPI, controller.POST)

  return router
}
