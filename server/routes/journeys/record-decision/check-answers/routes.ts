import { DecisionCheckAnswersController } from './controller'
import { JourneyRouter } from '../../base/routes'
import CsipApiService from '../../../../services/csipApi/csipApiService'

export const DecisionCheckAnswersRoutes = (csipApiService: CsipApiService) => {
  const { router, get, post } = JourneyRouter()
  const controller = new DecisionCheckAnswersController(csipApiService)

  get('/', controller.GET)
  post('/', controller.checkSubmitToAPI, controller.POST)

  return router
}
