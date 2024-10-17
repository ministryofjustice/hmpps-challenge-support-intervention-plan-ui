import { DeleteParticipantController } from './controller'
import { JourneyRouter } from '../../base/routes'
import CsipApiService from '../../../../services/csipApi/csipApiService'

export const DeleteParticipantRoutes = (csipApiService: CsipApiService) => {
  const { router, get, post } = JourneyRouter()
  const controller = new DeleteParticipantController(csipApiService)

  get('/', controller.GET)
  post('/', controller.POST)

  return router
}
