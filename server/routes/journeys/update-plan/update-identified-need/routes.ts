import { UpdateIdentifiedNeedController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import { schema } from '../../develop-an-initial-plan/summarise-identified-need/schemas'
import type CsipApiService from '../../../../services/csipApi/csipApiService'
import { JourneyRouter } from '../../base/routes'
import AuditService from '../../../../services/auditService'

export const UpdateIdentifiedNeedRoutes = (csipApiService: CsipApiService, auditService: AuditService) => {
  const { router, get, post } = JourneyRouter()
  const controller = new UpdateIdentifiedNeedController(csipApiService, auditService)

  get('/', controller.GET)
  post('/', validate(schema), controller.checkSubmitToAPI, controller.POST)

  return router
}
