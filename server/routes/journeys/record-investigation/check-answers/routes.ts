import { InvestigationCheckAnswersController } from './controller'
import { JourneyRouter } from '../../base/routes'
import CsipApiService from '../../../../services/csipApi/csipApiService'

export const InvestigationCheckAnswersRoutes = (csipApiService: CsipApiService) => {
  const { router, get, post } = JourneyRouter()
  const controller = new InvestigationCheckAnswersController(csipApiService)

  get('/', controller.GET)
  post('/', controller.checkSubmitToAPI, controller.POST)

  return router
}
