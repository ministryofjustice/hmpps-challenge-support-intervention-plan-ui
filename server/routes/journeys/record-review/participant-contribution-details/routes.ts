import { ParticipantDetailsController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import { schemaFactory } from './schemas'
import { JourneyRouter } from '../../base/routes'
import CsipApiService from '../../../../services/csipApi/csipApiService'

export const ParticipantDetailsRoutes = (csipApiService: CsipApiService) => {
  const { router, get, post } = JourneyRouter()
  const controller = new ParticipantDetailsController(csipApiService)

  get('/', controller.GET)
  post('/', validate(schemaFactory()), controller.POST)

  return router
}
