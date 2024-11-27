import { ReopenIdentifiedNeedController } from './controller'
import { JourneyRouter } from '../../base/routes'
import CsipApiService from '../../../../services/csipApi/csipApiService'
import AuditService from '../../../../services/auditService'

export const ReopenIdentifiedNeedRoutes = (csipApiService: CsipApiService, auditService: AuditService) => {
  const { router, get, post } = JourneyRouter()
  const controller = new ReopenIdentifiedNeedController(csipApiService, auditService)

  get('/', controller.GET)
  post('/', controller.checkSubmitToAPI, controller.POST)

  return router
}
