import { UpdateIdentifiedNeedsController } from './controller'
import type CsipApiService from '../../../../services/csipApi/csipApiService'
import { JourneyRouter } from '../../base/routes'
import AuditService from '../../../../services/auditService'

export const UpdateIdentifiedNeedsRoutes = (csipApiService: CsipApiService, auditService: AuditService) => {
  const { router, get } = JourneyRouter()
  const controller = new UpdateIdentifiedNeedsController(csipApiService, auditService)

  get('/', controller.GET)

  return router
}
