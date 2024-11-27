import { ScreenCheckAnswersController } from './controller'
import type CsipApiService from '../../../../services/csipApi/csipApiService'
import { JourneyRouter } from '../../base/routes'
import AuditService from '../../../../services/auditService'

export const ScreenCheckAnswersRoutes = (csipApiService: CsipApiService, auditService: AuditService) => {
  const { router, get, post } = JourneyRouter()
  const controller = new ScreenCheckAnswersController(csipApiService, auditService)

  get('/', controller.GET)
  post('/', controller.checkSubmitToAPI, controller.POST)

  return router
}
