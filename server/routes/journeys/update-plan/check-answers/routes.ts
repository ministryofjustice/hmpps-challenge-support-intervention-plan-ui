import { NewIdentifiedNeedCheckAnswersController } from './controller'
import { JourneyRouter } from '../../base/routes'
import CsipApiService from '../../../../services/csipApi/csipApiService'
import AuditService from '../../../../services/auditService'

export const NewIdentifiedNeedCheckAnswersRoutes = (csipApiService: CsipApiService, auditService: AuditService) => {
  const { router, get, post } = JourneyRouter()
  const controller = new NewIdentifiedNeedCheckAnswersController(csipApiService, auditService)

  get('/', controller.GET)
  post('/', controller.checkSubmitToAPI, controller.POST)

  return router
}
