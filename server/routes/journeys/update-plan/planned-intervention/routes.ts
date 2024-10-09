import { UpdatePlannedInterventionController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import { schemaFactory } from './schemas'
import type CsipApiService from '../../../../services/csipApi/csipApiService'
import { JourneyRouter } from '../../base/routes'

export const UpdatePlannedInterventionRoutes = (csipApiService: CsipApiService) => {
  const { router, get, post } = JourneyRouter()
  const controller = new UpdatePlannedInterventionController(csipApiService)

  get('/', controller.GET)
  post('/', validate(schemaFactory), controller.checkSubmitToAPI, controller.POST)

  return router
}
