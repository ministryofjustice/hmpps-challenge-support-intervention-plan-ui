import { UpdateAdditionalInformationController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import { schemaFactory } from '../../record-decision/additional-information/schemas'
import type CsipApiService from '../../../../services/csipApi/csipApiService'
import { JourneyRouter } from '../../base/routes'

export const UpdateAdditionalInformationRoutes = (csipApiService: CsipApiService) => {
  const { router, get, post } = JourneyRouter()
  const controller = new UpdateAdditionalInformationController(csipApiService)

  get('/', controller.GET)
  post('/', validate(schemaFactory), controller.checkSubmitToAPI, controller.POST)

  return router
}
