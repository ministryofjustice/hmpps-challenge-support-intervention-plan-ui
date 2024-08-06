import { ScreenCheckAnswersController } from './controller'
import type CsipApiService from '../../../services/csipApi/csipApiService'
import { JourneyRouter } from '../../base/routes'

export const ScreenCheckAnswersRoutes = (csipApiService: CsipApiService) => {
  const { router, get, post } = JourneyRouter()
  const controller = new ScreenCheckAnswersController(csipApiService)

  get('/', controller.GET)
  post('/', controller.checkSubmitToAPI, controller.POST)

  return router
}
