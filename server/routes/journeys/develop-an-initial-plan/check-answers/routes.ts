import { CheckAnswersController } from './controller'
import { JourneyRouter } from '../../base/routes'
import CsipApiService from '../../../../services/csipApi/csipApiService'

export const CheckAnswersRoutes = (csipApiService: CsipApiService) => {
  const { router, get } = JourneyRouter()
  const controller = new CheckAnswersController(csipApiService)

  get('/', controller.checkSubmitToAPI)
  return router
}
