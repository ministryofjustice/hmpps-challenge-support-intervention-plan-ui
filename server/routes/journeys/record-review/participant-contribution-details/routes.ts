import { ParticipantDetailsController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import { schema } from './schemas'
import { JourneyRouter } from '../../base/routes'
import CsipApiService from '../../../../services/csipApi/csipApiService'

export const ParticipantDetailsRoutes = (csipApiService: CsipApiService) => {
  const { router, get, post } = JourneyRouter()
  const controller = new ParticipantDetailsController(csipApiService)

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
