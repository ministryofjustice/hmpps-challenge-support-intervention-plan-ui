import { UpdateInvolvementController } from './controller'
import { validate } from '../../../../middleware/validationMiddleware'
import { schemaFactory } from '../../referral/involvement/schemas'
import type CsipApiService from '../../../../services/csipApi/csipApiService'
import { JourneyRouter } from '../../base/routes'
import AuditService from '../../../../services/auditService'

export const UpdateInvolvementRoutes = (csipApiService: CsipApiService, auditService: AuditService) => {
  const { router, get, post } = JourneyRouter()
  const controller = new UpdateInvolvementController(csipApiService, auditService)

  get('/', controller.GET)
  post('/', validate(schemaFactory(csipApiService)), controller.checkSubmitToAPI, controller.POST)

  return router
}
